# GymEntra — Veri Şeması Referansı

> **Bu dosya sürekli okunmak için değildir.** Yalnızca veritabanı şeması,
> koleksiyon ilişkileri, güvenlik kuralı veya sorgu/index işi yapılırken
> açılır. Rutin UI/ekran çalışmasında okumaya gerek yoktur.
>
> **Şema değişirse bu dosya aynı commit içinde güncellenir.** Kod ile bu
> dosya çeliştiğinde kod doğrudur; dosya hemen düzeltilmelidir.

**Firebase projesi:** `tarabyamarte` (marte06 web uygulamasıyla ortak)
**Bölge:** Cloud Functions `europe-west1`
**İstemci:** Firebase JS SDK v12 (native SDK **değil** — RN'de disk
kalıcılığı yok, bkz. `plan.md` P2-2)

**Kaynak dosyalar**
| Ne | Nerede |
|---|---|
| TypeScript tipleri | `gymentra-mobile/src/data/types.ts` |
| Firestore → tip dönüşümleri | `gymentra-mobile/src/data/firebase/convert.ts` |
| Sorgu/yazma katmanı | `gymentra-mobile/src/data/firebase/*Repo.ts` |
| Güvenlik kuralları | `marte06/firestore.rules` |
| Composite indexler | `marte06/firestore.indexes.json` |
| Storage kuralları | `marte06/storage.rules` |
| Cloud Functions | `marte06/functions/src/index.ts` |

---

## Genel kurallar

**Çok kiracılılık (multi-tenancy).** Her salon bir `tenant`. GymEntra
koleksiyonlarının tamamında `tenantId` alanı vardır ve her sorgu
`where('tenantId','==',...)` ile başlar. Kiracı izolasyonu güvenlik
kurallarıyla zorlanır — istemciye güvenilmez.

**Deterministik doküman kimlikleri.** Tekilliği kurallarla zorlamak ve
`get()` ile ucuz kontrol yapabilmek için bazı koleksiyonlarda id hesaplanır:

| Koleksiyon | Doküman kimliği |
|---|---|
| `tenant_memberships` | `{tenantId}_{userId}` |
| `calendar_shares` | `{tenantId}_{ownerTrainerId}_{viewerTrainerId}` |
| `push_tokens` | Expo push token'ının kendisi |
| diğerleri | Firestore otomatik id |

**Tarihler.** Firestore `Timestamp` olarak yazılır, `convert.ts` içindeki
`toDate()` ile JS `Date`'e çevrilir. Yazarken `serverTimestamp()` tercih
edilir (istemci saati güvenilmez).

**Gömülü diziler.** `programs.exercises`, `workout_logs.exerciseLogs`,
`classes.bookedUserIds` alt koleksiyon değil, gömülü dizidir: sınırlı
boyutlu ve daima bütün olarak okunup yazılıyorlar. Kısmi güncelleme yok —
dizi bütünüyle yeniden yazılır.

---

## Varlık ilişkileri

```
                    ┌──────────┐
                    │  tenants │  (salon / beyaz etiket kiracı)
                    └────┬─────┘
                         │ tenantId
     ┌───────────────────┼───────────────────────────┬───────────────┐
     │                   │                           │               │
┌────▼──────────────┐ ┌──▼──────┐  ┌──────────┐  ┌───▼──────────┐ ┌──▼─────────────┐
│ tenant_memberships│ │ classes │  │ payments │  │ gym_packages │ │ calendar_shares│
│  (üye/antrenör/   │ │ (grup   │  │ (manuel  │  │ (satılabilir │ │ (antrenör→     │
│   yönetici)       │ │  ders)  │  │  defter) │  │  katalog)    │ │  antrenör izin)│
└────┬──────────────┘ └─────────┘  └──────────┘  └──────────────┘ └────────────────┘
     │ userId (= Firebase Auth uid)
     │
     ├──► checkins        (salona giriş kaydı)
     ├──► programs        (antrenör yazar, üyeye atanır)
     │       └──► workout_logs  (üyenin programı uygulaması)
     ├──► measurements    (vücut ölçümleri)
     ├──► pt_sessions     (birebir randevu)
     ├──► push_tokens     (cihaz bildirim jetonu)
     └──► member_packages (gym_packages'tan atanmış, hakları kopyalar)
             └──► member_credits  (ders/grup dersi kota bakiyesi)
```

**Kritik nokta:** `userId` her yerde **Firebase Auth uid**'dir,
`tenant_memberships` doküman kimliği değil. Tek istisna `checkins.membershipId`
alanıdır (QR yükü olarak üyelik doküman kimliğini taşır).

---

## Koleksiyonlar

### `tenants` — salon
| Alan | Tip | Not |
|---|---|---|
| `code` | string | Katılım kodu, BÜYÜK HARF (ör. `TARABYA-01`). **Tekillik kurallarla zorlanmıyor** |
| `name` | string | |
| `branding` | map | `{ appName, primaryColor, accentColor, logoUrl?, themeMode? }` |
| `ownerUid` | string | Oluşturan kullanıcı; create'te `auth.uid`'e kilitli, sonra değişmez |
| `address` | string? | Katılım akışında gösterilir; herkese açık olması bilinçli |

⚠️ **İletişim bilgisi bu dokümana yazılmaz.** Salon dokümanı her oturum açmış
kullanıcıya okunabilir (kodla katılım). Hassas alanlar
`tenants/{id}/private/{docId}` alt koleksiyonuna gider — okuma
`isTenantMember`, yazma `isTenantAdmin`.
| `createdAt` / `updatedAt` | Timestamp | |

**Kurallar:** okuma = her oturum açmış kullanıcı (kodla katılım için).
Yazma = kiracı yöneticisi; `ownerUid` ve `code` değişmez. Silme kapalı.

**Küresel `admin` claim'i GymEntra koleksiyonlarında geçerli değildir**
(plan.md P1-6). Beyaz etiket üründe platform süper-kullanıcısı olmaz; destek
erişimi Admin SDK üzerinden Cloud Function ile yapılır. Legacy marte06
koleksiyonları kendi `isAdmin()` kontrollerini korur.

---

### `tenant_memberships` — kullanıcının bir salondaki rolü
**Doküman kimliği: `{tenantId}_{userId}`**

| Alan | Tip | Not |
|---|---|---|
| `userId` | string | Firebase Auth uid |
| `tenantId` | string | |
| `tenantCode` / `tenantName` | string | Denormalize kopya |
| `roles` | `MembershipRole[]` | **Bir kullanıcının bir salonda birden çok rolü olabilir** (küçük salonda sahip genelde antrenör de). Roller örtük değildir, açıkça verilir. |
| `role` | `MembershipRole` | **Legacy** — `roles` göçü sırasında korunuyor, eski build'ler bunu okuyor. Tüm istemciler güncellendikten sonra silinecek. |
| `permissions` | `MembershipPermission[]` | Yöneticinin devrettiği dar yetenekler. Şu an tek değer: `'checkin'`. |
| `status` | `'pending' \| 'active' \| 'rejected' \| 'suspended'` | |
| `userDisplayName` / `userEmail` | string? | Denormalize — istemci başka kullanıcının Auth profilini okuyamaz, onay ekranı bu kopyaya muhtaç |
| `shortCode` | string? | 6 haneli elle giriş kodu (kiracı içinde tekil) |
| `phone` / `birthDate` | string? / Timestamp? | Yalnızca marte06'dan taşınan üyelerde — bkz. aşağı |
| `requestedAt` / `approvedAt` | Timestamp | |

**Kurallar:** okuma = kendisi veya kiracı personeli (`isTenantStaff`).
Create = yalnızca kendisi için `member`/`pending`; istisna: kiracıyı yeni
kuran `ownerUid` kendine `admin`/`active` verebilir. Update = yalnızca kiracı
yöneticisi ve yalnızca `status`, `approvedAt`, `roles`, `role`,
`permissions` alanları — ayrıca **yönetici kendi `admin` rolünü
düşüremez** (salonu yönetimsiz bırakmasın).

**Rol anlamları**
- `member` — üye. Kendi kartı, programı, ölçümü, ödemesi.
- `trainer` — antrenör. Üye listesi, program yazma, kendi PT takvimi.
- `admin` — salon yöneticisi. Onaylar, ödeme defteri, markalaşma, dersler,
  tüm antrenör takvimlerini gözetleme.

**Roller örtük değildir.** Yönetici otomatik olarak antrenör sayılmaz —
antrenörlük yapmayan bir sahibin navigasyonunda PT takvimi olmaz. Aynı kişi
ikisini de yapıyorsa `roles: ['admin','trainer']` açıkça verilir.

**Yetenek kontrolü ekranlarda ham karşılaştırmayla yapılmaz.** Tek doğruluk
kaynağı `gymentra-mobile/src/data/membership.ts`:
`canManageGym` · `canCheckIn` · `canCoach` · `canOverseeCalendars` ·
`isStaff` · `primaryRole`.

**Sorgu notu:** rol filtreleri `where('roles','array-contains', …)` şeklinde.
Bu, `(tenantId, status, roles CONTAINS)` composite index'ini gerektirir.

**`phone` / `birthDate` — yalnızca göç edilen üyelerde (20 Ağustos 2026).**
WEB-2 taşıması (bkz. aşağıdaki WEB bölümü) yalnızca ad/e-posta/rol
kopyaladı; telefon ve doğum günü marte06'nın `members` koleksiyonunda kaldı.
`marte06/scripts/backfill_member_contact_info.cjs` (Admin SDK, kural
atlar — bilerek: yeni üye kaydında bu alanlar hiç toplanmıyor, self-servis
yazma yolu yok) `memberUid` üzerinden eşleştirip kopyalıyor. **Kural
değişikliği yok** — okuma zaten tüm doküman için kendisi/kiracı personeli
kapsamında.

---

### `classes` — grup dersi (tek seferlik oluşum, tekrarlayan seri değil)
| Alan | Tip | Not |
|---|---|---|
| `tenantId` | string | |
| `name` / `trainerName` | string | `trainerName` denormalize metin, uid değil |
| `date` | Timestamp | |
| `durationMinutes` / `capacity` | number | |
| `bookedUserIds` | string[] | Auth uid dizisi |
| `waitlistUserIds` | string[] | |

**Kurallar:** okuma **ve** yazma salona aktif üyelik gerektirir
(`isTenantMember`) — çapraz kiracı sızıntısı kapatıldı. Yazma = kiracı
yöneticisi **veya** üyenin kendi uid'ini tek bir dizide ekleyip çıkarması
(`isOnlySelfArrayToggle`). Kapasite kural düzeyinde kontrol edilir. Bekleme
listesinden otomatik yükseltme **yok** (plan.md P2-8).

**Sorgu notu:** istemci yalnızca bugünden itibaren ve `limit(100)` ile
dinliyor.

**Index:** `tenantId ASC, date ASC`

---

### `checkins` — salona giriş kaydı (değiştirilemez)
| Alan | Tip | Not |
|---|---|---|
| `tenantId` / `userId` | string | |
| `membershipId` | string | `{tenantId}_{userId}` — QR yükü |
| `checkedInAt` | Timestamp | |

**Kurallar:** okuma/create = `canCheckIn(tenantId)` — yani yönetici **veya**
`permissions` içinde `'checkin'` olan personel. Üye kendi kendine giriş
yapamaz; personel okutmalı. Update/delete kapalı. Mükerrer kayıt engeli
**yok** (plan.md P2-5).

**Index:** `tenantId ASC, checkedInAt ASC`

---

### `programs` — antrenman programı
| Alan | Tip | Not |
|---|---|---|
| `tenantId` / `memberId` / `trainerId` | string | Hepsi Auth uid |
| `memberName` | string | Denormalize |
| `name` | string | |
| `status` | `'draft' \| 'active'` | |
| `exercises` | ProgramExercise[] | Gömülü: `{ id, name, sets, reps, targetWeightKg }` |
| `createdAt` / `updatedAt` | Timestamp | |

**Kurallar:** okuma = programın üyesi veya kiracı personeli. Yazma = kiracı
personeli; `tenantId` ve `memberId` değişmez.

**İş kuralı:** üye başına aynı anda en fazla bir `draft` + bir `active`
program beklenir (`findOrCreateDraftProgram` bunu varsayar) — ancak kurallarla
zorlanmıyor.

---

### `workout_logs` — üyenin bir programı uygulaması
| Alan | Tip | Not |
|---|---|---|
| `tenantId` / `memberId` / `programId` | string | |
| `programName` | string | Denormalize |
| `startedAt` | Timestamp | |
| `completedAt` | Timestamp? | Yoksa antrenman sürüyor |
| `exerciseLogs` | ExerciseLog[] | `{ exerciseId, name, setsTarget, setsCompleted, weightKg, durationSeconds? }` |

`durationSeconds`: egzersiz başına **aktif** süre (duraklatılan süre hariç).
Kalori/gelişim raporlaması bu alana dayanacak. Eski kayıtlarda yok —
tüketiciler `completedAt - startedAt`'e düşmeli.

**Kurallar:** okuma = üyenin kendisi veya kiracı personeli. Create = yalnızca
kendisi için. Update = yalnızca `exerciseLogs` + `completedAt`. Silme kapalı.

**Index:** `tenantId ASC, memberId ASC, startedAt ASC`

---

### `measurements` — vücut ölçümü (yalnızca ekleme)
| Alan | Tip | Not |
|---|---|---|
| `tenantId` / `memberId` | string | |
| `weightKg` | number | Zorunlu |
| `chestCm` / `waistCm` / `armCm` | number? | |
| `recordedAt` | Timestamp | |

**Kurallar:** okuma = üyenin kendisi veya kiracı personeli. Create = yalnızca
kendisi için. **Update/delete kapalı** — geçmiş düzeltilemez.

**Index:** `tenantId ASC, memberId ASC, recordedAt DESC`

---

### `payments` — manuel ödeme defteri
> ⚠️ **Uygulama hiçbir zaman kart/banka bilgisi işlemez.** Ödeme salon ile üye
> arasında uygulama dışında gerçekleşir; burası yalnızca kayıt defteridir.
> ⚠️ `firestore.rules` içinde bu yol için **iki ayrı match bloğu** var
> (legacy marte06 + GymEntra). Firestore bunları OR'lar (plan.md P1-2).

| Alan | Tip | Not |
|---|---|---|
| `tenantId` / `memberId` | string | |
| `memberName` | string | Denormalize |
| `amount` | number | > 0 |
| `method` | `'cash' \| 'bank_transfer'` | |
| `status` | `'pending' \| 'confirmed' \| 'rejected'` | |
| `note` | string? | |
| `createdAt` / `confirmedAt` | Timestamp | |

**Akış:** Yönetici girerse doğrudan `confirmed`. Üye bildirirse `pending` →
yönetici `confirmed`/`rejected` yapar.

**Index:** `tenantId ASC, createdAt DESC` ve `tenantId ASC, memberId ASC, createdAt DESC`

---

### `gym_packages` — satılabilir paket kataloğu (PKG-1)
| Alan | Tip | Not |
|---|---|---|
| `tenantId` | string | |
| `name` | string | Serbest metin — "Gold", "8 Ders". Koda gömülü tip değil |
| `kind` | `'membership' \| 'lessons'` | |
| `price` | number | |
| `durationDays` | number? | `membership` için zorunlu |
| `lessonCount` / `lessonValidityDays` | number? | `lessons` için |
| `entitlements` | map | `{ gymAccess, groupClasses?, ptLessons? }` — bkz. aşağı |
| `freezePolicy` | map? | `{ minDays, maxCount }` — `membership` için |
| `activeAssignmentCount` | number | **Sunucu sahipli.** İstemci asla yazamaz — kilit buna dayanır |
| `supersedesId` | string? | Yeni sürümse eskiye bağ |
| `isActive` / `sortOrder` | | |
| `createdAt` / `updatedAt` | Timestamp | |

**Haklar (`entitlements`) — sabit tip değil, adlandırılmış hak çantası:**
```
{ gymAccess: true,
  groupClasses: { unlimited: true } | { count, periodDays },  // yoksa hak yok
  ptLessons:    { count, periodDays } }                        // yoksa hak yok
```
Ekranlar `entitlements.ptLessons != null` diye sorar, paketin `name`'ini
`"Gold"` ile karşılaştırmaz — admin içeriği değiştirebildiği için isim hiçbir
şey garanti etmez.

**Değişmezlik — satılmış paket donar:** `activeAssignmentCount > 0` iken
kural yalnızca `isActive`/`sortOrder` değişimine izin verir. İçerik
değiştirmek isteyen admin `createPackageVersion` ile yeni sürüm açar
(`supersedesId` ile eskiye bağlanır); eski kayıt `isActive:false` olur ama
**silinmez** — silinirse ona bağlı `member_packages` kayıtları yetim kalırdı.

**Varsayılan şablonlar tohum veridir, kod sabiti değil.** Yeni salon
açıldığında (`createTenantWithOwner` → `seedDefaultPackages`) üç doküman
yazılır (Silver/Gold/Platinium), o andan sonra salonun malıdır. Uygulama
kodunda `if (name === 'Gold')` gibi bir dal **hiçbir yerde yok.**

**Index:** `tenantId ASC, sortOrder ASC`

---

### `member_packages` — bir üyeye atanmış paket (PKG-2)
| Alan | Tip | Not |
|---|---|---|
| `tenantId` / `memberId` / `memberName` | | `memberName` denormalize |
| `packageId` / `packageName` / `kind` / `entitlements` / `freezePolicy` | | Atama anında **kopyalanır** — katalog sonra değişse de bu satır değişmez |
| `listPrice` / `finalPrice` | number | Şimdilik eşit; PKG-5 promosyonla ayrışacak |
| `promotionId` / `promotionName` / `bonusDays` / `bonusLessons` | | PKG-5, henüz yazılmıyor |
| `startsAt` / `endsAt` | Timestamp | `membership`: `+durationDays`. `lessons`: `+lessonValidityDays` |
| `frozenDays` / `freezes` | number / array | PKG-10, henüz yazılmıyor (`0` / `[]`) |
| `status` | `'active' \| 'frozen' \| 'expired' \| 'cancelled'` | **`status` tek başına güvenilmez** — PKG-12'nin günlük fonksiyonu gelene kadar süresi geçmiş bir paket hâlâ `active` görünebilir. Her zaman `endsAt`'i de kontrol et. |
| `paymentId` | string? | Ödeme defterine bağ |
| `assignedAt` / `assignedBy` | | |

**Kurallar:** okuma = kendisi veya kiracı personeli. Yazma = yalnızca
`create`, ve yalnızca kiracı yöneticisi (`assignedBy == auth.uid`, hedef
paket `isActive`). **Update/delete tamamen kapalı** — her sonraki geçiş
(dondurma, iptal, süre dolumu, PKG-6'nın değişimi) sunucu sahipli.

**Değişmezlik uyarısı:** bu doğrudan atama yolu (`assignPackageToMember`)
yalnızca **ilk/ek atama** için doğru. PKG-6 (`package_change_requests`)
geldiğinde, zaten paketi olan bir üyenin paketini *değiştirmek* onay akışına
gitmeli — bu fonksiyon o zaman çağrılmamalı.

---

### `member_credits` — kota bakiyesi, kaynağı ne olursa olsun (PKG-2)
| Alan | Tip | Not |
|---|---|---|
| `tenantId` / `memberId` | | |
| `kind` | `'ptLesson' \| 'groupClass'` | Tek defter, iki hak türü |
| `source` | `'purchase' \| 'entitlement'` | Satın alınan ders paketi / periyodik hak |
| `sourcePackageId` | string | **`gym_packages` değil, `member_packages` dokümanı** — hangi atamadan geldiğini bilmek gerekiyor (yenileme fonksiyonu bunu okuyor) |
| `total` / `used` | number | `used` **sunucu sahipli**, istemci hiçbir koşulda yazamaz |
| `startsAt` / `expiresAt` | Timestamp | |
| `status` | `'active' \| 'exhausted' \| 'expired'` | |

**Kurallar:** okuma = kendisi veya kiracı personeli. Yazma = yalnızca
`create` (kiracı yöneticisi, `used == 0` zorunlu). **Update/delete kapalı**
— tüketim (PKG-8) ve iade (PKG-11) henüz yazılmadı, geldiklerinde de
istemciden değil bir callable'dan (Admin SDK) yazacaklar.

**Tüketim sırası:** krediler `expiresAt` artan sırayla harcanır (önce
biteni önce) — bunu uygulayan kod henüz yok (PKG-8), ama sıralama zaten
`watchMemberCredits`'in sorgu sırası.

**`renewEntitlementCredits`** (günlük, `functions/`) her `source:'entitlement'`
kredisinin süresi dolduğunda bir sonrakini açar — ama yalnızca kaynağı olan
`member_packages` hâlâ `active` ve süresi dolmamışsa. Aksi halde sessizce
durur; sona ermiş bir üyelik yeni ders üretmeye devam etmez.

---

### `pt_sessions` — birebir randevu (grup dersinden ayrı)
| Alan | Tip | Not |
|---|---|---|
| `tenantId` / `trainerId` / `memberId` | string | |
| `trainerName` / `memberName` | string | Denormalize |
| `originalTrainerId` | string? | İlk devirde bir kez yazılır, sonra korunur |
| `date` | Timestamp | |
| `durationMinutes` | number | |
| `status` | `'scheduled' \| 'completed' \| 'cancelled'` | |
| `createdAt` / `updatedAt` | Timestamp | |

**Devir modeli — üç yol:**
1. Kiracı yöneticisi koşulsuz atar (antrenör gelmediğinde).
2. Atanmış antrenör kendi randevusunu düzenler.
3. `calendar_shares` izni olan meslektaş **yalnızca kendine** devralır
   (kural, değişen alanları `trainerId, trainerName, originalTrainerId,
   updatedAt` ile sınırlar).

**Index:** `tenantId ASC, trainerId ASC, date ASC` ve `tenantId ASC, date ASC`

---

### `calendar_shares` — antrenörün meslektaşına takvim izni
**Doküman kimliği: `{tenantId}_{ownerTrainerId}_{viewerTrainerId}`**

| Alan | Tip |
|---|---|
| `tenantId` / `ownerTrainerId` / `viewerTrainerId` | string |
| `ownerTrainerName` | string (denormalize) |
| `createdAt` | Timestamp |

Kimlik deterministik olduğu için bir antrenör **yalnızca kendi** takvimini
paylaşabilir (`ownerTrainerId == auth.uid` kuralı). Update kapalı; iptal =
silme.

---

### `push_tokens` — Expo bildirim jetonu
**Doküman kimliği: token'ın kendisi** (yeniden kayıtta doğal tekilleşme)

| Alan | Tip |
|---|---|
| `userId` | string |
| `tenantId` | string |
| `updatedAt` | Timestamp |

**Kurallar:** istemci okuması **kapalı** (`allow read: if false`). Yalnızca
Cloud Functions (Admin SDK) okur. Temizlik mekanizması yok (plan.md P1-7).

---

## Legacy koleksiyonlar (marte06 web uygulaması)

GymEntra bunları **kullanmaz**; aynı projede yaşarlar ve kurallar dosyasını
paylaşırlar. Dokunmadan önce marte06 tarafını kontrol et.

`members`, `assigned_packages`, `lessons`, `packages`, `settings`, `branches`
ve `payments` için ikinci (legacy) match bloğu.

---

## Cloud Functions

| Fonksiyon | Tetikleyici | İş |
|---|---|---|
| `setAdminClaim` | onCall | Küresel admin custom claim atar |
| `seedAdminClaims` | onCall | Toplu claim atama |
| `createAuthUserOnNewMember` | `members` create | Legacy (marte06) |
| `notifyOnMembershipApproved` | `tenant_memberships` update | Üyelik onaylandı push'u |
| `notifyOnPaymentStatusChange` | `payments` update | Ödeme onay/ret push'u |
| `notifyOnProgramAssigned` | `programs` update | Program atandı push'u |
| `syncPackageAssignmentCount` | `member_packages` yazım | `gym_packages.activeAssignmentCount` senkronu (PKG-1 kilidinin dayanağı) |
| `renewEntitlementCredits` | zamanlanmış (günlük, 24 saat) | Periyodik hakları (Platinium'un çeyreklik dersi, kotalı grup dersi) bir sonraki döneme yuvarlar (PKG-2) |

> Bu tablo eksik: `deleteMyAccount`, `assignMembershipShortCode`,
> `promoteFromClassWaitlist`, `syncActiveMemberCount` RM fazında eklendi ama
> hiç yazılmadı. Buraya dokunan bir sonraki kişi tamamlasın.

Push gönderimi Expo API'sine (`exp.host/--/api/v2/push/send`) Node 22'nin
yerleşik `fetch`'i ile yapılır; ek bağımlılık yok.

---

## Şema değiştirirken kontrol listesi

1. `src/data/types.ts` içindeki tipi güncelle.
2. `convert.ts` dönüşümünü güncelle (eksik alanlarda geriye dönük uyumlu ol —
   eski dokümanlarda yeni alan yoktur, `?`/varsayılan kullan).
3. İlgili `*Repo.ts` sorgusunu/yazımını güncelle.
4. `firestore.rules` — yeni alan yazılabilir mi, kim yazabilir?
5. Sorgu eşitlik dışı filtre veya farklı alanda `orderBy` içeriyorsa
   `firestore.indexes.json`'a composite index ekle.
6. **Bu dosyayı güncelle.**
7. `firebase deploy --only firestore:rules,firestore:indexes --dry-run` ile
   doğrula, sonra kullanıcı onayıyla production'a çık.
