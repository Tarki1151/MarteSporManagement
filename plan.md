# GymEntra — İyileştirme Planı

Bu dosya, uygulamanın tam denetimi (akışlar, veri şeması, güvenlik kuralları,
performans, mağaza hazırlığı) sonucunda çıkan iş listesidir. Tek takip
kaynağıdır: bir madde tamamlandığında kutusu işaretlenir ve altına kısa bir
"nasıl çözüldü" notu düşülür.

**Denetim tarihi:** 19 Ağustos 2026
**Kapsam:** `gymentra-mobile/` (Expo SDK 57 istemci) + `marte06/` (Firestore
kuralları, indexler, Cloud Functions) — paylaşılan Firebase projesi `tarabyamarte`.

**Öncelik anahtarı**
| Seviye | Anlamı |
|---|---|
| **P0** | Yayına çıkmayı engeller. Mağaza reddi veya gerçek kullanıcı kaybı. |
| **P1** | Güvenlik / veri bütünlüğü. Yayından önce kapatılmalı. |
| **P2** | Doğruluk ve dayanıklılık. İlk sürüme yetişmeli. |
| **P3** | Performans / maliyet. Ölçeklenince acıtır. |
| **P4** | Ürün boşlukları. v1.1 planına girebilir. |
| **P5** | Kod sağlığı / teknik borç. |

---

## P0 — Yayın engelleyiciler

### [~] P0-1 · Freemium duvarı çıkışsız bir çıkmaz → gerçek IAP aboneliğine bağlanacak
`gymentra-mobile/src/app/admin/members.tsx:60-64` — aktif üye sayısı
`FREE_MEMBER_LIMIT = 10`'a ulaşınca `approveMembership()` **hiç çağrılmıyor**,
kullanıcı `/paywall` ekranına yönlendiriliyor. `paywall.tsx:56`'daki
"Pro'ya geç ve Deniz'i onayla" butonu ise sadece `safeBack()` yapıyor — hiçbir
satın alma, yükseltme veya talep akışı yok.

Sonuç: gerçek bir salon 11. üyesini **hiçbir zaman onaylayamaz**. Üstelik
kullanıcıya hata da gösterilmiyor, istek sessizce onaylanmamış kalıyor.

Ek olarak `paywall.tsx` uydurma veri içeriyor: "Deniz'in isteği", "312 QR
check-in işlendi", "46 ders rezervasyonu", "₺749/ay".

#### ✅ Karar (19 Ağustos 2026)

Limit **kalıyor**, ancak arkasına gerçek bir uygulama içi satın alma (IAP)
aboneliği bağlanacak.

| | |
|---|---|
| Ücretsiz kademe | 10 aktif üyeye kadar |
| Premium — aylık | **500 TL / ay** |
| Premium — yıllık | **5.000 TL / yıl** (aylığa göre indirimli) |
| Kim öder | **Yalnızca salon sahibi/yöneticisi.** Üyelerden ve antrenörlerden asla ücret alınmaz. |
| Kanal | App Store IAP + Google Play Billing |

> Not: 500 × 12 = 6.000 TL, yıllık 5.000 TL ≈ **%17 indirim**. Pazarlamada
> "%20" denecekse yıllık fiyat 4.800 TL olmalı — fiyat metni yazılmadan önce
> netleştirilmeli.

#### Uyarı — komisyon ve B2B istisnası
Apple ve Google, uygulama işlevini açan dijital abonelikte kendi ödeme
sistemlerini zorunlu kılar ve **%15–30 komisyon** alır (ilk yıl sonrası veya
küçük geliştirici programında %15). 500 TL'lik abonelikte bu aylık 75–150 TL
demektir.

Alternatif: Apple Guideline **3.1.3(e) Enterprise Services** ve Google'ın
benzeri istisnası, **işletmelere** satılan hizmetlerde uygulama dışı
satın almaya izin verir — ancak uygulama içinden harici ödemeye **link
verilemez** ve akış tamamen uygulama dışında kurgulanmalıdır. GymEntra
salon sahiplerine satılan bir B2B SaaS olduğu için bu istisna teknik olarak
uygulanabilir; ancak inceleme riski taşır ve kullanıcı deneyimi bölünür.

**Mevcut karar: IAP ile ilerlemek.** Komisyon kabul edilmiş sayılır.

#### Durum — 19 Ağustos 2026

Sunucu ve arayüz tarafı **tamamlandı**; kalan işler harici hesap kurulumu
gerektiriyor (RevenueCat, App Store Connect, Play Console) ve bende
yapılamaz.

**Bu turda çözülen asıl hata:** limit aşıldığında `approve()` sessizce
`return` ediyordu — yönetici butona basıyor, hiçbir şey olmuyordu. Artık
"X sırada bekliyor — üye limitine ulaştın" mesajı gösteriliyor ve isteğin
silinmediği açıkça söyleniyor. Kural reddi (bayat istemci sayımı) de
yakalanıp aynı şekilde açıklanıyor.

#### Kalan (mağaza hesapları gerekiyor — bunlar bende yapılamaz)
- [x] Abonelik durumu veri modeli: `Tenant.subscription`
      (`status`, `plan`, `expiresAt`, `platform`) + `activeMemberCount`.
      **İkisi de sunucu sahipli** — kural, istemcinin bu iki alanı
      değiştirmesini engelliyor (test edildi).
- [ ] IAP kütüphanesi seçimi. `expo-in-app-purchases` **kaldırıldı**;
      seçenekler `react-native-iap` (doğrudan, makbuz doğrulamasını kendin
      yaparsın) veya **RevenueCat** (abonelik durumu, yenileme, iptal ve
      çapraz platform senkronizasyonunu üstlenir).
      → Oturumun başında RevenueCat *üye aidatları* için reddedilmişti; bu
      farklı bir kullanım (salon sahibinin SaaS aboneliği) ve mağaza kuralı
      gereği IAP zorunlu. Karar ayrıca alınmalı.
- [ ] App Store Connect + Play Console'da abonelik ürünlerinin tanımlanması
      (aylık/yıllık, Türkiye fiyatlandırması, abonelik grubu).
- [ ] Sunucu tarafı makbuz doğrulama (Cloud Function) + App Store Server
      Notifications / Google Play Real-time Developer Notifications ile
      yenileme ve iptal takibi.
- [x] `paywall.tsx` yeniden yazıldı. Uydurma istatistikler ("312 QR check-in",
      "46 ders rezervasyonu") ve uydurma isim ("Deniz") kaldırıldı; gerçek
      `activeMemberCount` gösteriliyor, iki plan (500₺/ay, 5.000₺/yıl) listeleniyor.
      **Çalışmayan bir satın alma butonu konmadı** — bunun yerine mağaza
      kurulumunun tamamlanmadığı açıkça yazıldı. "Satın alımları geri yükle"
      butonu IAP bağlanınca eklenecek.
- [x] `firestore.rules`: limit sunucuda zorlanıyor. Kurallar doküman
      sayamadığı için `syncActiveMemberCount` Cloud Function'ı
      `tenants/{id}.activeMemberCount` alanını güncel tutuyor; kural onu
      okuyor. Yalnızca `member` rolü sayılıyor — antrenör işe almak salonu
      ücretli plana itmiyor. Aktif abonelik limiti kaldırıyor.
      Canlıda doğrulandı: üye eklenince 51→52, silinince 52→51.
- [ ] Abonelik bitince ne olur? Mevcut üyeler **kilitlenmemeli** (veri
      rehin alınmaz); yalnızca yeni üye onayı durur. Bu davranış yazılı
      olarak netleştirilmeli.
- [x] `BILLING_EXEMPT_TENANTS` tamamen kaldırıldı. Koda gömülü muafiyet
      listesi yerine pilot salona veri tarafında `subscription.plan:
      'grandfathered'` verildi — kural zaten aboneliği tanıyor, ikinci bir
      mekanizmaya gerek kalmadı.
      ⚠️ Bu şarttı: canlı salonun 51 üyesi var; sayaç dolduğu anda kural yeni
      üye onayını kilitleyecekti.

### [x] P0-2 · Hesap silme yok — Apple kesin ret sebebi
App Store Review Guideline **5.1.1(v)**: hesap oluşturmaya izin veren her
uygulama, **uygulama içinden hesap silme** imkânı sunmak zorundadır.

**Çözüldü ve 19 Ağustos 2026'da production'a deploy edildi.**
- `marte06/functions/src/index.ts` → yeni `deleteMyAccount` onCall fonksiyonu
  (region `europe-west1`). Admin SDK ile çalışıyor çünkü güvenlik kuralları
  istemcinin `measurements`/`workout_logs`/`payments`/`checkins` silmesini
  bilinçli olarak engelliyor.
  - **Sert silme:** `tenant_memberships`, `measurements`, `workout_logs`,
    `checkins`, `push_tokens`, `programs`, `calendar_shares` (her iki yön).
  - **Anonimleştirme:** `payments` — `memberName` "Silinmiş üye" yapılır,
    `note` silinir, `memberId` korunur (salonun defteri bozulmasın).
  - **İptal:** gelecekteki `pt_sessions` `cancelled` yapılır; geçmiş takvim
    olduğu gibi kalır.
  - **Koruma:** salonun **son aktif yöneticisi** silinemez — aksi halde salon
    yönetilemez hale gelirdi (`failed-precondition` ile açıklayıcı hata).
  - Batch'ler 400'lük parçalara bölünüyor (Firestore 500 yazma sınırı).
- `src/services/accountDeletion.ts` — callable sarmalayıcı.
- `src/components/DeleteAccountButton.tsx` — **iki adımlı** onay, yıkıcı
  stil. Üç rolün ekranına da eklendi.

**Kalan:**
- [ ] Gerçek cihazda uçtan uca test (yeni build gerekiyor).
- [ ] Gizlilik politikasına silme prosedürü ve saklama süreleri eklenmeli
      (ödeme kayıtlarının anonimleştirilerek saklandığı açıkça yazılmalı).
- [ ] Play Console'daki "hesap silme URL'i" alanı için web tarafında bir
      talep sayfası gerekebilir (uygulama içi silme varken çoğu durumda
      yeterli sayılıyor, doğrulanmalı).

### [x] P0-3 · Gereksiz mikrofon izni (`RECORD_AUDIO`)
`gymentra-mobile/app.json:27-30` Android izinleri arasında
`android.permission.RECORD_AUDIO` var. Uygulama yalnızca QR okutuyor, ses
kaydetmiyor. Gereksiz hassas izin hem Play Store incelemesinde risk hem de
Data Safety formunda yanlış beyana yol açar.

**Çözüldü.** İzin `expo-camera` plugin'inin varsayılanından geliyordu
(`recordAudioAndroid = true`). `app.json`'da plugin'e `recordAudioAndroid:
false` ve `microphonePermission: false` verildi — böylece hem Android
`RECORD_AUDIO` izni hem de iOS `NSMicrophoneUsageDescription` anahtarı
üretilmiyor. (İzni `permissions` listesinden silmek yetmezdi; plugin onu
tekrar ekliyordu.)
⚠️ Native değişiklik — etkili olması için yeni EAS build gerekiyor.

### [x] P0-4 · Uygulama içi Gizlilik / Şartlar bağlantısı yok
Sayfalar yayında (`gymentra.salt-tech-apps.com/privacy/`, `/terms/`) ama
uygulama içinden erişilemiyor. Her iki mağaza da uygulama içinde erişilebilir
olmasını bekler.

**Çözüldü.** `src/components/LegalLinks.tsx` eklendi; üç rolün de ekranına
yerleştirildi: `member/card.tsx`, `trainer/profile.tsx`,
`admin/settings.tsx`.

### [x] P0-5 · Üretime sızan geliştirme ekranları
**Çözüldü.** `src/app/states.tsx` (tasarım durum galerisi) ve
`src/app/checkin-success.tsx` (simüle-check-in butonu kaldırıldıktan sonra
ölü kod) silindi; `_layout.tsx`'teki `Stack.Screen` kayıtları da kaldırıldı.
`paywall.tsx` P0-1 kapsamında yeniden yazılacağı için duruyor.

---

## RM — Rol ve yetki modeli (mimari)

> Bu bölüm 19 Ağustos 2026'da kullanıcı talebiyle eklendi ve P1'den hemen
> sonra ele alınmalı: hem güvenlik (check-in yetkisi) hem ürün (küçük
> salonlarda sahip = antrenör) hem de mevcut bir hatayı kapsıyor.

### [x] RM-1 · Model tek role sıkışmış — tamamlandı

`TenantMembership.role` **tek değerli** (`'member' | 'trainer' | 'admin'`) ve
doküman kimliği `{tenantId}_{userId}` olduğu için bir kullanıcının bir salonda
**yalnızca bir rolü** olabiliyor.

Desteklenmesi istenen dört senaryo:

| Senaryo | Bugün |
|---|---|
| Yalnızca salon sahibi (antrenörlük yapmaz) | ✅ çalışıyor |
| Yalnızca antrenör | ✅ çalışıyor |
| **Sahip aynı zamanda antrenör** (küçük salon) | ❌ **temsil edilemiyor** |
| **Antrenör + üye kabul (check-in) yetkisi verilmiş** | ❌ **temsil edilemiyor** |

Ek olarak, check-in şu an yalnızca yöneticiye açık
(`firestore.rules` → `checkins` create `isTenantAdmin`). Gerçek bir salonda
resepsiyonu çoğunlukla antrenör/personel tutar ve sahip her zaman orada olmaz.
(Bu, daha önce **P2-6** olarak da kaydedilmişti — RM-2 onu kapsıyor.)

**Ayrıca hâlihazırda bir tutarsızlık var:** `trainer/programs` ve
`trainer/calendar` admin'i `isStaff` ile kabul ederken, `trainer/index`
(Üyeler) ve `trainer/profile` `role === 'trainer'` şartı koşuyor. Admin
ayarlardan takvime girdiğinde "Üyeler" sekmesi kilitli geliyor.

### Önerilen model

```ts
export type MembershipRole = 'member' | 'trainer' | 'admin';
export type MembershipPermission = 'checkin';        // ileride genişler

export interface TenantMembership {
  // ...
  roles: MembershipRole[];              // YENİ — `role`ün yerini alır
  role?: MembershipRole;                // legacy, göç boyunca korunur
  permissions?: MembershipPermission[]; // devredilmiş dar yetkiler
}
```

**Neden iki ayrı kavram?**
- **`roles`** = hangi uygulama yüzeyini görürsün (üye sekmeleri / antrenör
  sekmeleri / yönetici sekmeleri). "Sahip aynı zamanda antrenör" bir rol
  *bileşimi*dir, yetki değil.
- **`permissions`** = yöneticinin, tüm yönetici yüzeyini vermeden devrettiği
  dar yetenek. "Ben yokken Mert üye kabul etsin" demek, Mert'e markalaşma
  ayarlarını ve ödeme defterini açmak anlamına gelmemeli.

**Rol bileşimi örtük olmamalı.** Yönetici otomatik olarak antrenör
sayılmamalı — antrenörlük yapmayan bir sahibin navigasyonunda PT takvimi
olmamalı. Aynı kişi ikisini de yapıyorsa `roles: ['admin','trainer']` açıkça
verilir.

### Yetenek yardımcıları (tek doğruluk kaynağı)

Ekranlar `role === 'admin'` gibi ham karşılaştırma yapmayı bırakmalı;
`src/data/membership.ts` içinde tek yerde tanımlanan yardımcıları kullanmalı:

| Yardımcı | Anlamı |
|---|---|
| `canManageGym(m)` | `admin` — onaylar, ödeme defteri, markalaşma, dersler |
| `canCheckIn(m)` | `admin` **veya** `permissions` içinde `checkin` |
| `canCoach(m)` | `trainer` — kendi takvimi, kendi üyeleri, program yazma |
| `canOverseeCalendars(m)` | `admin` — tüm antrenörlerin takvimini görme/devretme |

`canCoach` ve `canOverseeCalendars` ayrı olmalı: takvim ekranı zaten
"yönetici = gözetim modu, randevu oluşturma yok" ayrımını yapıyor, bu
yardımcılar onu isimlendiriyor.

### Navigasyon — çoklu rol

`roles.length > 1` olduğunda kullanıcı iki yüzey arasında geçebilmeli.

- `AuthContext` → `activeRole` (kullanıcı bazlı `AsyncStorage`'da saklanır) +
  `setActiveRole`.
- `/` yönlendirmesi: geçerliyse `activeRole`, değilse öncelik sırası
  **admin > trainer > member**.
- Rol değiştirici **yalnızca birden fazla rol varsa** görünür; profil/ayarlar
  ekranına ve tercihen başlık alanına konur.

### Güvenlik kuralları

`isTenantAdmin` / `isTenantStaff` yeni şekli okurken eski dokümanları da
tolere etmeli:

```
function membershipRoles(tid) {
  let m = get(/databases/$(database)/documents/tenant_memberships/$(tid + '_' + request.auth.uid)).data;
  return m.get('roles', [m.get('role', '')]);
}
```

Yeni: `isTenantCheckinStaff(tid)` = `admin` **veya** `permissions` içinde
`checkin`. `checkins` create kuralı `isTenantAdmin` yerine bunu kullanmalı.

`permissions` alanını **yalnızca kiracı yöneticisi** değiştirebilmeli —
antrenör kendine check-in yetkisi veremez. Mevcut membership update kuralı
şu an yalnızca `['status','approvedAt']` değişimine izin veriyor;
`roles` ve `permissions` de yönetici için açılmalı, ama **kendi rolünü
düşürüp salonu yönetimsiz bırakmaması** için son-yönetici koruması gerekir
(`deleteMyAccount`'taki mantığın aynısı).

### Sorgu ve index değişiklikleri

`where('role','==','member')` → `where('roles','array-contains','member')`.
Etkilenen: `watchActiveMembers`, `watchActiveTrainers`.

Yeni composite index gerekiyor (array-contains + eşitlikler index birleştirme
ile çözülemez):

```json
{ "collectionGroup": "tenant_memberships", "queryScope": "COLLECTION",
  "fields": [ {"fieldPath":"tenantId","order":"ASCENDING"},
              {"fieldPath":"status","order":"ASCENDING"},
              {"fieldPath":"roles","arrayConfig":"CONTAINS"} ] }
```

### Göç sırası (canlı proje — sıra önemli)

1. **Kuralları önce deploy et**, her iki şekli de kabul edecek biçimde
   (geriye dönük uyumlu, tek başına hiçbir şeyi bozmaz).
2. Index'i ekle ve deploy et.
3. **Backfill script'i:** her `tenant_memberships` dokümanına
   `roles: [role]` yaz. `role` alanı geri dönüş için **silinmez**.
4. `roles ?? [role]` okuyan ve `roles` yazan istemciyi yayınla.
5. Tüm kullanıcılar yeni sürüme geçtikten sonra `role` alanı ve kurallardaki
   legacy dal temizlenir.

### Yapılacaklar

- [x] **RM-1** `types.ts` → `roles` + `permissions`; `convert.ts` geriye dönük
      okuma (`roles ?? [role]`).
- [x] **RM-2** `canCheckIn` yetkisi + `checkins` kuralının gevşetilmesi
      (eski **P2-6** bu maddeye taşındı).
- [x] **RM-3** `src/data/membership.ts` yetenek yardımcıları; tüm ekranlardaki
      ham `role === '...'` karşılaştırmalarının değiştirilmesi.
- [x] **RM-4** `trainer/index` ve `trainer/profile` tutarsızlığının
      giderilmesi (admin'in kilitli "Üyeler" sekmesi).
- [x] **RM-5** `activeRole` + rol değiştirici UI.
      `src/services/activeRole.ts` (uid bazlı kalıcı tercih),
      `AuthContext.activeRole` / `setActiveRole`,
      `src/components/RoleSwitcher.tsx` — tek rollülerde **hiç render
      edilmiyor**. Üç rolün ekranına da yerleştirildi. `/` yönlendirmesi
      `activeRole ?? primaryRole` kullanıyor. Artık verilmeyen bir rol
      saklanmışsa (admin'likten düşürülmüş biri) otomatik olarak geçerli
      role düşülüyor.
- [x] **RM-6** Yönetici ekranında rol/yetki atama arayüzü.
      `src/app/admin/staff.tsx` — "Ekip ve yetkiler". Antrenörlere kapıda
      üye kabulü yetkisi verilip alınabiliyor, üyeler antrenör yapılabiliyor.
      Salon ayarlarından linklendi. Yönetici olanlarda yetki zaten açık
      olduğu için buton yerine açıklama gösteriliyor.
- [x] **RM-7** Kurallar + index + backfill + son-yönetici koruması.
- [x] **RM-8** Kural testleri: çoklu rol, devredilmiş check-in yetkisi,
      antrenörün kendine yetki verememesi, son yöneticinin rolünü
      düşürememesi.
- [x] **RM-9** `SCHEMA.md` güncellemesi.


---

## P1 — Güvenlik

> Tümü `marte06/firestore.rules` içinde. Her değişiklik `firebase deploy
> --only firestore:rules --dry-run` ile doğrulanıp, kullanıcı onayıyla
> production'a gitmeli.

### [x] P1-1 · `classes` her kiracıya açık — çok kiracılı izolasyon kırık
```
match /classes/{classId} {
  allow read: if isSignedIn();
```
Herhangi bir hesabı olan **herkes**, tüm salonların ders programını, antrenör
isimlerini, tarihlerini ve **rezervasyon yapan üyelerin uid listesini**
(`bookedUserIds`, `waitlistUserIds`) okuyabiliyor. Çok kiracılı bir üründe bu
doğrudan veri sızıntısıdır.

Düzeltme: okuma `isTenantMember(resource.data.tenantId)` benzeri bir yardımcıya
bağlanmalı (kullanıcının o kiracıda aktif üyeliği var mı). İstemci sorguları
zaten `where('tenantId','==',...)` ile geldiği için sorgu uyumlu kalır.

### [x] P1-2 · İki ayrı `match /payments/{paymentId}` bloğu
Kuralların içinde biri legacy (marte06 `members` koleksiyonuna dayalı), biri
yeni GymEntra defteri olmak üzere **aynı yol için iki match bloğu** var.
Firestore bunları OR'lar — yani en gevşek olan kazanır. Bu, ileride bir bloğu
sıkılaştırıp diğerini unutmaya açık ciddi bir ayak kapanıdır.

Düzeltme: legacy blok kaldırılmalı veya iki ürün ayrı koleksiyonlara
(`payments` / `gym_payments`) taşınmalı.

### [x] P1-3 · `tenantId` doğrulanmadan veri enjeksiyonu
`workout_logs`, `measurements` ve `payments` create kurallarında `tenantId`
yalnızca `is string` olarak kontrol ediliyor; kullanıcının o kiracıya gerçekten
üye olduğu doğrulanmıyor.

Sonuç: kötü niyetli bir kullanıcı, üyesi olmadığı **herhangi bir salona**
sahte ölçüm, antrenman kaydı veya "ödeme bildirimi" yazabilir. Ödeme
bildirimleri o salonun yöneticisinin onay kuyruğunda görünür.

Düzeltme: `isTenantMember(tid)` yardımcısı ekleyip create kurallarına koşul olarak
bağlanmalı. Ayrıca `payments` için makul bir üst tutar sınırı konmalı.

### [x] P1-4 · `pt_sessions` yetki sınırları gevşek
- **create:** `isTenantStaff(tenantId)` yeterli; `trainerId == request.auth.uid`
  zorunlu değil. Bir antrenör başka bir antrenörün takvimine randevu yazabilir.
- **update:** atanmış antrenör (`resource.data.trainerId == auth.uid`) **tüm
  alanları** değiştirebiliyor — `tenantId`, `memberId`, `date` dahil. Kaydı
  başka bir kiracıya taşımak bile mümkün.

Düzeltme: create'te `trainerId` sahiplik kontrolü; update'te
`changedKeys().hasOnly([...])` ile alan kısıtı ve `tenantId`/`memberId`
değişmezliği.

### [x] P1-5 · `tenants` ve `packages` genel okumaya açık
`tenants` okuma `isSignedIn()` — salon kodu ile katılım için gerekli, ancak
tüm salonların `contactEmail`, `contactPhone`, `address` bilgilerini de açığa
çıkarıyor. İletişim alanları ayrı bir alt dokümana taşınıp yalnızca üyelere
açılmalı. `packages` (legacy) benzer şekilde tüm oturum açmış kullanıcılara
açık.

**Çözüldü.** İletişim alanlarının hiçbiri okunmuyordu **ve hiçbir salonda
veri yoktu** — yani tamamen ölü alanlardı. `contactEmail`/`contactPhone`
tipten ve `convert.ts`'ten kaldırıldı; böylece sızma yüzeyi tümüyle ortadan
kalktı.

Sonradan eklenmeleri gerekirse diye desen şimdiden kuruldu ve kural yazıldı:
`tenants/{id}/private/{docId}` → okuma `isTenantMember`, yazma
`isTenantAdmin`. Salon dokümanı bilerek herkese açık kalıyor (kodla katılım
buna muhtaç), bu yüzden hassas alan oraya **asla** yazılmamalı — kurala not
düşüldü.

`address` korundu: katılım akışında üyenin doğru salonu seçtiğini teyit
etmesini sağlıyor.

**`packages` bilinçli olarak değiştirilmedi.** O bir marte06 (web)
koleksiyonu; paket adları hassas değil ve daraltmak web uygulamasının
yeniden test edilmesini gerektirirdi. Gerekçe kurala yazıldı.

### [x] P1-6 · Küresel `isAdmin()` iddiası tüm kiracıları aşıyor
marte06'dan gelen `request.auth.token.admin == true` custom claim'i, GymEntra
tarafındaki **her kiracının** her verisine tam erişim veriyor. Tek ürün
olduğunda mantıklıydı; çok kiracılı beyaz etiket üründe bir platform
süper-kullanıcısıdır. Bilinçli bir karar olarak belgelenmeli ya da GymEntra
koleksiyonlarından kaldırılmalı.

**Çözüldü — küresel claim GymEntra koleksiyonlarından kaldırıldı.**
`isTenantAdmin`, `isTenantStaff`, `isTenantMember`, `canCheckIn` ve
`tenants` update kuralındaki `isAdmin()` bypass'ları silindi.
Legacy marte06 koleksiyonları (`members`, `lessons`, `packages`, `settings`,
`branches`, legacy `payments`) kendi `isAdmin()` kontrollerini koruyor.

Yetenek kaybı yok: gerçek destek işi Admin SDK ile Cloud Function içinde
yapılır, o zaten kuralları baypas ediyor ve sunucu tarafında iz bırakıyor —
her istemci oturumunu sessizce genişleten bir claim'in aksine.

**Deploy öncesi bulunan risk:** `tarkan.cicek@gmail.com` küresel claim'e
sahipti ama **hiçbir salonda üyeliği yoktu**; kural değişikliği onu GymEntra'dan
tamamen kilitleyecekti. Kullanıcı kararıyla claim korundu (marte06 için
gerekli) ve hesaba `tarabya-marte` salonunda gerçek `admin` üyeliği
oluşturuldu. Yeni açılacak hesaplara küresel claim verilmeyecek.

Regresyon testleri eklendi: küresel claim artık başka bir salonun ölçüm,
antrenman, program, ödeme ve üyelik verisini **okuyamıyor**, salon adını
değiştiremiyor, üye rolü atayamıyor, check-in yazamıyor — ama legacy marte06
erişimi duruyor.

### [x] P1-7 · `push_tokens` sahiplik doğrulaması zayıf
Doküman kimliği token'ın kendisi; create kuralı yalnızca `userId == auth.uid`
kontrol ediyor. Bir kullanıcı, sahip olmadığı bir token'ı kendi kimliğiyle
kaydedebilir. Ayrıca token'lar hiç temizlenmiyor (kullanıcı çıkış yapınca da
kalıyor) — zamanla ölü token birikir.

Düzeltme: çıkışta `unregisterPushToken()` çağrısı; Cloud Function'da Expo'nun
`DeviceNotRegistered` yanıtında token silme.

---

## P2 — Doğruluk ve dayanıklılık

**Çözüldü.**
- **Çıkışta iptal:** `signOutAndForget()` artık cihazın Expo token'ını
  `unregisterPushToken()` ile siliyor. Asıl önemi ortak cihazda: önceki
  kullanıcının kaydı kalırsa telefonu sonra alan kişi **onun bildirimlerini**
  alıyordu. `activeRole` tercihi de burada temizleniyor.
- **Ölü token temizliği:** `sendPushToUser()` Expo'nun yanıtındaki
  `DeviceNotRegistered` biletlerini eşleştirip ilgili dokümanları siliyor
  (uygulama silinmiş/token iptal edilmiş cihazlar).
- **Kural sıkılaştırması:** doküman kimliği `ExponentPushToken[...]`
  biçimine uymalı, `platform` `ios`/`android` olmalı ve yazan kişi o salonun
  aktif üyesi olmalı.

**Dürüst sınır:** kurallar opak bir token'ın gerçekten çağıranın cihazına ait
olduğunu kanıtlayamaz. Etkisi de veri sızıntısı değil, rahatsızlık: saldırgan
kendi bildirimlerini başkasının cihazına yönlendirebilir. Gerçek savunmalar
yukarıdaki iki madde; bu sınır kurala yorum olarak yazıldı.

### [x] P2-1 · 29 `onSnapshot` çağrısının hiçbirinde hata yakalayıcı yok
`src/data/firebase/*.ts` içinde 29 adet `onSnapshot(query, onNext)` var, **hiçbiri**
üçüncü parametre olan `onError` geri çağrısını vermiyor.

Sonuç: izin reddi veya ağ hatası olduğunda dinleyici sessizce ölür, ekran
sonsuza kadar boş/yükleniyor durumunda kalır. Daha önce antrenör üye
listesinde yaşadığımız `permission-denied` hatası tam olarak böyle
görünmüştü — kullanıcıya hiçbir şey söylenmedi.

**Çözüldü.**
- Yeni `src/data/firebase/watch.ts` → `watchQuery` / `watchDoc`
  sarmalayıcıları. Her düşen abonelik artık **konsola bağlam adıyla**
  yazılıyor (`[firestore] Üye listesi aboneliği düştü: permission-denied …`)
  ve isteğe bağlı bir `onError` geri çağrısına iletiliyor.
- 12 repo dosyasındaki **29 ham `onSnapshot` çağrısının tamamı** bu
  sarmalayıcıya taşındı; kodda `watch.ts` dışında ham `onSnapshot` kalmadı.
- Yeni `src/components/ErrorNotice.tsx` (mesaj + "Tekrar dene").
- Ekranlara bağlandı: `trainer/index`, `trainer/programs`, `trainer/calendar`,
  `admin/members`. Yeniden abone olma `retryKey` ile yapılıyor.

**Kalan:** diğer ekranlarda (üye tarafı) hata durumu henüz yüzeye
çıkarılmadı — repo katmanı hazır, sadece bağlanması gerekiyor.

### [x] P2-2 · Çevrimdışı çalışmıyor — tasarım varsayımıyla çelişiyor
`src/services/firebase.ts:24` → `initializeFirestore(app, {})`. Firebase **JS**
SDK'sı React Native'de diske kalıcı önbellek desteklemez (yalnızca bellek içi).
`member/card.tsx` yorumunda "resepsiyon wifi'si güvenilmezdir, çevrimdışı
çalışmalı" yazıyor ama gerçekte uygulama çevrimdışı açılınca üyelik verisi
gelmediği için **QR kart hiç render olmuyor**.

**Çözüldü (Seçenek A).**
- Yeni `src/services/membershipCache.ts` — üyelik + salon bilgisi
  `AsyncStorage`'a yazılıyor (uid bazlı anahtar, Date alanları için reviver).
- `AuthContext` artık **önce diskten** okuyup ekranı dolduruyor, sonra ağdan
  tazeliyor. Ağ başarısız olursa önbellekteki kartla devam ediliyor.
- `membershipFromCache` bayrağı eklendi; üye kartında **gerçek** bir
  "✈ çevrimdışı — kayıtlı kartın" göstergesi var (eskisi her zaman görünen
  sahte bir etiketti, kaldırılmıştı).
- Yarış koşulu koruması: `activeUidRef` ile hızlı hesap değişiminde eski
  yanıtın yeni kullanıcının durumunu ezmesi engellendi.
- Yeni `src/services/signOut.ts` → `signOutAndForget()`. Önbellek **çıkıştan
  önce** temizleniyor; sonrasında `auth.currentUser` null olacağı için kimin
  kaydının silineceği bilinemezdi ve ortak cihazda önceki üyenin kartı diskte
  kalırdı. Tüm çıkış noktaları buna bağlandı.

**Not:** Firestore verisinin geri kalanı hâlâ çevrimiçi gerektiriyor. Tam
çevrimdışı kalıcılık için native SDK'ya (Seçenek B) geçmek gerekir.

### [x] P2-3 · Kısa kod tahsisi izin hatasına düşebiliyor
`membershipRepo.ts:allocateShortCode()` — `requestJoin()` içinden, kullanıcı
**henüz o kiracının üyesi değilken** `tenant_memberships` üzerinde sorgu
çalıştırıyor. Sorgu boş dönerse Firestore izin verir; bir çakışma olursa
okunamayan bir doküman döneceği için sorgu `permission-denied` fırlatır ve
katılım isteği hata verir.

Düzeltme: kısa kodu istemcide üretmeyi bırak; üyelik onaylanırken bir Cloud
Function (Admin SDK, kuralları aşar) ata. Çakışma kontrolü orada güvenli.

**Çözüldü.** Kısa kod üretimi istemciden kaldırıldı; yeni Cloud Function
`assignMembershipShortCode` (`onDocumentCreated` → `tenant_memberships`)
Admin SDK ile çakışma kontrolü yapıp kodu atıyor. `requestJoin()` ve
`createTenantWithOwner()` artık `shortCode` yazmıyor, `allocateShortCode()`
tamamen silindi. Zaten kodu olan (göç edilmiş/eski) dokümanlara dokunulmuyor.
Beş çakışmada pes edip hata logluyor — 900 binlik uzayda bu şanssızlık değil,
veri bozukluğu işaretidir.

Canlıda doğrulandı: kodsuz bir üyelik oluşturuldu, tetikleyici kodu atadı,
test kaydı silindi.

### [x] P2-4 · Üyeye dokunmak sessizce taslak program yaratıyor
`src/app/trainer/index.tsx:70` — `openClient()` her dokunuşta
`findOrCreateDraftProgram()` çağırıyor. Yani antrenör listeye göz atarken bile
veritabanında boş taslak programlar oluşuyor ve Programlar sekmesini kirletiyor.

Düzeltme: üyeye dokununca bir **üye detay ekranı** açılmalı (mevcut program,
son ölçümler, antrenman geçmişi, yaklaşan randevular); program oluşturma
oradaki açık bir butonla yapılmalı.

**Çözüldü.** Yeni `src/app/trainer/member.tsx` — üyenin programı, antrenman
özeti (toplam/süre/son antrenman) ve ölçümleri tek ekranda. Üye listesindeki
dokunma artık buraya gidiyor ve **hiçbir şey yazmıyor**;
`findOrCreateDraftProgram` yalnızca ekrandaki açık "Program oluştur"
butonundan çağrılıyor. Ölü `openingFor` durumu kaldırıldı.
Yeni index gerekmedi — üç sorgu da mevcut indexleri kullanıyor.

### [x] P2-5 · Check-in mükerrer kaydı engellemiyor
`checkinRepo.ts` — aynı üye arka arkaya okutulursa iki ayrı `checkins` kaydı
oluşur ve günlük sayaç şişer. Aynı üye için son N dakika içinde kayıt varsa
"zaten giriş yapmış" yanıtı dönmeli.

**Çözüldü.** Her iki check-in yolu ortak `recordCheckIn()` üzerinden geçiyor;
son **60 dakika** içinde kaydı olan üye için yazma yapılmadan
`already-checked-in` dönüyor ("Bu üye az önce zaten giriş yaptı."). Pencere
kazara çift okutmayı ve kısa bir dışarı çıkışı yutacak, akşam tekrar gelişi
engellemeyecek şekilde seçildi.
Yeni index: `checkins` (tenantId, userId, checkedInAt) — deploy edildi.

### [x] P2-6 · Check-in yalnızca yöneticiye açık → **RM-2**'de çözüldü
`firestore.rules` → `checkins` create `isTenantAdmin()` istiyor. Gerçek bir
salonda resepsiyonu genelde yönetici değil personel/antrenör tutar. Antrenör
rolü de check-in yapabilmeli (`isTenantStaff`), ya da ayrı bir "resepsiyon"
rolü tanımlanmalı.

### [x] P2-7 · Üye kendi giriş geçmişini göremiyor
`CheckIn` tipi ve kuralları var, üye için okuma izni de var — ama hiçbir ekran
göstermiyor. Üyenin "bu ay kaç kez geldim" sorusu cevapsız. Gelişim ekranına
doğal olarak eklenir.

**Çözüldü.** `watchMyCheckins()` eklendi ve Gelişim ekranına "SALONA GELİŞ"
kartı kondu: bu hafta / bu ay / son 12 hafta + son geliş tarihi. Dinleyici 12
haftayla sınırlı. Kurallar zaten üyenin kendi kayıtlarını okumasına izin
veriyordu; eksik olan sadece arayüzdü.

### [x] P2-8 · Bekleme listesi otomatik ilerlemiyor
Kurallarda belgelenmiş bilinçli bir eksik: bir üye rezervasyonunu iptal
edince bekleme listesindeki ilk kişi otomatik yükseltilmiyor (tek-uid toggle
modeli iki farklı kullanıcının dizisini aynı yazımda değiştiremiyor).
Cloud Function ile çözülmeli — aksi halde yönetici elle takip etmek zorunda.

**Çözüldü.** Yeni Cloud Function `promoteFromClassWaitlist`
(`onDocumentUpdated` → `classes`). Bir yer boşaldığında bekleme
listesindeki ilk kişiyi rezervasyona alıp listeden çıkarıyor ve ona push
bildirimi gönderiyor.

Kurallarla yapılamamasının sebebi belgelenmişti: rezervasyon "tek uid
self-toggle" modeliyle korunuyor, terfi ise **başka bir kullanıcının** uid'ini
iki dizi arasında taşımayı gerektiriyor. Admin SDK bu yazımın güvenli olduğu
tek yer.

Kendi yazımını tekrar tetiklememesi için yalnızca `bookedUserIds` **küçüldüyse**
çalışıyor; ayrıca zaten rezervasyonu olan bir bekleme kaydını yinelemiyor.

### [x] P2-9 · Üye salondan ayrılamıyor
Üyelik iptali / salondan ayrılma akışı yok. Yalnızca yönetici `suspended`
yapabiliyor. Üyenin kendi üyeliğini sonlandırma hakkı olmalı (P0-2 hesap
silmeden ayrı bir ihtiyaç).

---

## P3 — Performans ve maliyet

**Çözüldü.** `MembershipStatus`'a `'left'` eklendi (`suspended` yönetici
işlemini ima ettiği için ayrı tutuldu) + `leftAt`. `leaveTenant()` repo
fonksiyonu ve `LeaveGymButton` (üye kartında, onaylı). Kural: kişi yalnızca
**kendi** üyeliğini, yalnızca `active` iken, yalnızca `status`+`leftAt`
alanlarını değiştirerek sonlandırabiliyor.
**Yöneticiler bu yoldan ayrılamıyor** — salonun sonuncusu olabilirler ve
kurallar kalan yönetici sayısını sayamaz; sahiplik devri ayrı bir akış.
Testler: 57/57 (6'sı yeni).

### [x] P3-1 · Hiçbir sorguda `limit()` yok — sınırsız okuma
Tüm dinleyiciler koleksiyonun tamamını çekiyor:

| Fonksiyon | Sorun |
|---|---|
| `watchClassesForTenant` | Tüm dersler, geçmiş dahil, tarih filtresi yok |
| `watchPaymentsForTenant` | Salonun tüm ödeme geçmişi |
| `watchSessionsForTenant` / `ForTrainer` | Tüm randevular, geçmiş dahil |
| `watchMeasurements` | Tüm ölçüm geçmişi |
| `watchWorkoutLogsForMember` | Tüm antrenman kayıtları |
| `watchProgramsForTenant` | Tüm programlar |
| `watchActiveMembers` | Tüm üyeler |

Bir yıl işleyen orta ölçekli bir salonda bu, her ekran açılışında binlerce
doküman okuması demek — hem gecikme hem doğrudan Firestore faturası.

**Çözüldü.**
| Sorgu | Yeni sınır |
|---|---|
| `watchClassesForTenant` | bugünden itibaren + `limit(100)` |
| `watchPaymentsForTenant` | `limit(200)` |
| `watchPaymentsForMember` | `limit(50)` |
| `watchMeasurements` | `limit(100)` |
| `watchWorkoutLogsForMember` | en yeni `limit(200)`, istemcide ters çevrilir |
| `watchSessionsForTrainer` / `ForTenant` | **tarih aralığı parametresi** (P3-2) |

Hiçbiri yeni composite index gerektirmedi — mevcut indexler yeterliydi,
simülatörde doğrulandı.

⚠️ `watchWorkoutLogsForMember` artık son 200 antrenmanla sınırlı; Gelişim
ekranındaki "toplam" bu pencereyi ifade ediyor. Daha fazlası gerekirse
`getCountFromServer` ile ayrı bir sayım gerekir.

### [x] P3-2 · Takvim ekranı gereksiz veri çekiyor
`trainer/calendar.tsx` tüm randevuları çekip istemcide seçili güne filtreliyor.

**Çözüldü.** `watchSessionsForTrainer` / `watchSessionsForTenant` artık
`{ from, to }` aralığı alıyor; takvim ekranı görüntülenen aya göre (önünde ve
arkasında birer hafta payla, ızgaranın taşan hücrelerinde de nokta görünsün
diye) abone oluyor. Ay değiştikçe abonelik yenileniyor.

### [~] P3-3 · Kullanılmayan bağımlılıklar native derlemeyi şişiriyor
Kaynak kodda hiç kullanılmayanlar:
`@shopify/flash-list`, `expo-glass-effect`, `expo-symbols`, `@expo/ui`,
`expo-web-browser`, `expo-linking`, `react-native-gesture-handler`,
`expo-system-ui`, `expo-status-bar`.

(`react-dom` / `react-native-web` yalnızca web hedefi içindir — web'i
desteklemeyeceksek onlar da gidebilir.)

Not: bazıları başka paketlerin geçişli bağımlılığı olabilir; kaldırmadan önce
`npx expo-doctor` ile doğrulanmalı.

**Kısmen çözüldü — ve bu listenin üçte biri yanlışmış.**
- `expo-linking` **kullanılıyor** (P0-4'te eklediğim `LegalLinks`).
- `react-native-gesture-handler` ve `expo-symbols` **expo-router'ın kendi
  bağımlılıkları** — package.json'dan çıkarılsalar da kurulu kalırlar, yani
  native derlemeyi hiç küçültmezler.
- `expo-glass-effect` ve `@expo/ui` de başka paketlerce çekiliyor.
- `expo-system-ui` bırakıldı: `app.json`'daki `userInterfaceStyle` ayarını o
  yönetiyor.

**Kaldırılanlar:** `expo-web-browser`, `expo-status-bar`,
`@shopify/flash-list`. `tsc` ve lint temiz.
⚠️ Native derleme etkisi ancak yeni bir EAS build ile doğrulanabilir.

### [x] P3-4 · Aynı veri birden çok ekranda ayrı ayrı dinleniyor
`watchActiveMembers` en az üç ekranda ayrı dinleyicilerle çağrılıyor
(`trainer/index`, `trainer/calendar`, `trainer/profile`). Paylaşılan bir veri
katmanı (React Query / Zustand / context) hem okuma sayısını hem de yeniden
render'ı azaltır.

---

## P4 — Ürün boşlukları

- [ ] **P4-1 · Ders rezervasyonu üyeye görünür değil.** `classes` ekranı var ama
      üyenin "rezervasyonlarım" görünümü yok.
- [ ] **P4-2 · Antrenör üyenin ilerlemesini göremiyor.** Program yazıyor ama
      üyenin ölçümleri/antrenman geçmişi antrenöre kapalı (kurallar izin
      veriyor, ekran yok). Koçluk için temel ihtiyaç.
- [ ] **P4-3 · Bildirim tercihleri yok.** Push açık/kapalı ayarı, kategori
      bazlı tercih yok. GDPR/KVKK açısından da beklenir.
- [ ] **P4-4 · Üye profil düzenleme yok.** Ad, telefon, doğum tarihi, fotoğraf
      düzenlenemiyor. Kayıt ekranındaki "Doğum günü, fotoğraf vs. SONRA
      sorulur" vaadi karşılanmamış.
- [ ] **P4-5 · Yönetici raporlaması yok.** Aylık gelir, katılım oranı, aktif
      üye trendi — salon sahibinin ilk soracağı şeyler.
- [ ] **P4-6 · Çoklu salon üyeliği desteklenmiyor.** `getActiveMembership()`
      ilk aktif üyeliği alıp diğerlerini yok sayıyor. Kullanıcı iki salona
      üyeyse ikincisine hiç erişemez.
- [ ] **P4-7 · Dil desteği sabit Türkçe.** Tüm metinler koda gömülü. i18n
      altyapısı yoksa ihracat mümkün değil.

---

## P5 — Kod sağlığı

- [ ] **P5-1 · Test kapsamı** — ⚠️ *İlk denetimde "hiç test yok" yazmıştım,
      bu **yanlıştı**.* `marte06/tests/firestore.rules.test.ts` (355 satır) ve
      `npm run test:rules` script'i zaten mevcut: vitest +
      `@firebase/rules-unit-testing` + Firestore emülatörü.
      Kapsadıkları: legacy marte06 koleksiyonları, `tenants`,
      `tenant_memberships`, `classes` (yazma), `checkins`.
      **Kapsamayanlar (bu turda eklendi):** `programs`, `workout_logs`,
      `measurements`, GymEntra `payments`, `pt_sessions`, `calendar_shares`,
      `push_tokens` ve çapraz kiracı izolasyonu.
      Kalan: mobil uygulama tarafında hiç test yok (birim/bileşen).

- [x] **P5-7 · `firebase deploy --only functions` eski kodu yüklüyordu.**
      `firebase.json`'da `predeploy` hook'u yoktu; `npm run build` hiç
      çalışmadığı için deploy her seferinde `functions/lib/` içindeki **eski
      derlenmiş JS'i** gönderiyordu. Yeni `deleteMyAccount` fonksiyonu ilk
      deploy'da bu yüzden hiç oluşmadı.
      **Çözüldü.** `firebase.json` → `functions.predeploy` eklendi
      (`npm --prefix "$RESOURCE_DIR" run build`), yeniden deploy edildi ve
      `deleteMyAccount` oluştuğu doğrulandı.
- [ ] **P5-2 · Hata izleme yok.** Sentry/Crashlytics entegre değil; sahadaki
      çökme ve hatalardan haberimiz olmuyor.
- [x] **P5-3 · `react-hooks/exhaustive-deps` uyarıları temizlendi (12 → 0).**
      Risk teorik değildi: `workout_logs` index hatası tam da bu gürültünün
      içinde kaybolmuştu (bkz. DEV-1).

      Bastırmak yerine kod dürüstleştirildi — `const uid = user?.uid` bir kez
      bağlanıp effect'ler ve bağımlılık dizileri onu kullanıyor; gerçekten
      değişen değer zaten oydu. `user`'ın guard ile daraltıldığı yerlerde
      (`save`, `submit`, `toggleShare`) `user.uid` korundu.
      `workout/session.tsx`'te bağımlılık `log` yerine `log.startedAt`
      milisaniyesine indirildi — tüm log'a bağlamak, üye her seti
      işaretlediğinde kronometreyi sıfırlardı.

      Artık `npx expo lint` **sıfır hata, sıfır uyarı**.
- [x] **P5-4 · ~~`GymClass` tipi ölü~~ — ⚠️ bu iddia YANLIŞTI.**
      Tip ölü değil: `ClassSession` ham Firestore dokümanı,
      `GymClass` ise `toGymClass()`'ın ürettiği **UI view-model'i**
      (saat metni, rozet tonu, rezervasyon durumu). `member/index.tsx`,
      `member/classes.tsx` ve `data/classDisplay.ts` aktif kullanıyor;
      silmek uygulamayı bozardı. İkisi çakışmıyor, katman ayrımı bilinçli.

      *Not: ilk denetimde doğrulanmadan yazılmış üçüncü yanlış iddia
      (bkz. P5-1 "hiç test yok", P3-3 bağımlılık listesi). Plandaki
      iddialar uygulanmadan önce koda bakılarak doğrulanmalı.*
- [x] **P5-5 · CI kuruldu.**

      `gymentra-mobile/.github/workflows/ci.yml` — `npm ci` + `tsc --noEmit`
      + `expo lint --max-warnings 0`. **Uyarılar hata sayılıyor**; keyfi bir
      katılık değil: kırık bir Firestore sorgusu günlerce 12 exhaustive-deps
      uyarısının içinde gizli kaldı (DEV-1).
      → İlk çalıştırma **yeşil** doğrulandı (run 32298840421). `.env`
      olmadan da geçiyor.

      `marte06/.github/workflows/ci.yml` — iki iş: güvenlik kuralı testleri
      (gerçek emülatöre karşı, JDK 21 ile) ve functions derlemesi. İkincisi
      ayrı çünkü deploy `functions/lib`'i yüklüyor; derleme sessizce
      düşerse deploy eski çıktıyı gönderir (P5-7).
      → İkisi de CI'ın çalıştıracağı komutlarla **yerel olarak doğrulandı**
      (70/70 test, build OK). GitHub'da henüz koşmadı — depo push edilmedi.
- [~] **P5-6 · Firestore indexleri elle yönetiliyor.** Yeni sorgu eklendiğinde
      index unutulursa hata sahada çıkıyor (bu denetimde de yaşandı — DEV-1).

      Kısmen hafifledi: `watch.ts` sarmalayıcısı artık her düşen aboneliği
      bağlam adıyla logluyor, DEV-1 tam da böyle yakalandı. Ama bu tespit,
      önleme değil. Gerçek çözüm, kural testlerine benzer şekilde emülatöre
      karşı çalışan sorgu testleri olurdu — emülatör eksik index'i aynı
      `failed-precondition` ile bildirir.

---

## Mağaza hazırlığı

**Çözüldü.** `src/data/firebase/sharedWatch.ts` — referans sayan paylaşım
katmanı. İlk abone gerçek dinleyiciyi açıyor, sonrakiler ona bağlanıyor ve
son değeri anında alıyor (boş ekran flaşı olmuyor). Son abone ayrıldıktan
sonra **5 sn** bekleniyor, böylece iki sekme arasında gidip gelmek dinleyiciyi
sürekli kurup yıkmıyor.

Paylaşılanlar: `watchActiveMembers`, `watchActiveTrainers`,
`watchProgramsForTenant`, `watchActiveProgramsForTenant`. Antrenörde Üyeler +
Takvim + Profil sekmeleri aynı anda mount olduğu için üye listesi tek başına
3 kat okunuyordu.

**Ekranlarda hiçbir değişiklik gerekmedi** — `watch*` imzaları aynı kaldı.
Çıkışta `resetSharedWatches()` çağrılıyor; ortak cihazda sonraki hesap
öncekinin önbelleğe alınmış satırlarını görmüyor.

### iOS — App Store

- [x] Bundle identifier: `com.gymentra.mobile`
- [x] App Store Connect kaydı açık (app id `6802950274`)
- [x] Uygulama adı, ikon, splash
- [x] Sign in with Apple (Google girişi sunulduğu için zorunlu) — aktif
- [x] `ITSAppUsesNonExemptEncryption: false`
- [x] Kamera / fotoğraf izin açıklamaları (Türkçe, `app.json` plugin'lerinde)
- [x] App Privacy anketi dolduruldu (Contact Info, Fitness, Financial,
      Identifiers — hepsi App Functionality + Linked, tracking yok)
- [x] Gizlilik politikası URL'i
- [x] Açıklama, anahtar kelimeler, destek/pazarlama URL'i
- [ ] **Ekran görüntüleri** — 6.5" (1284×2778) seti hazırlanıyor
- [ ] **Hesap silme akışı** (P0-2) — bu olmadan kesin ret
- [ ] Uygulama içi gizlilik/şartlar bağlantısı (P0-4)
- [ ] Yaş sınırı (age rating) anketi
- [ ] Demo hesap bilgileri — inceleme ekibi giriş yapabilmeli; salon kodu ve
      onaylı bir test üyesi App Review Notes'a yazılmalı (**kritik**: onay
      bekleyen bir hesapla incelemeci hiçbir şey göremez ve ret gelir)
- [ ] TestFlight ile gerçek cihaz doğrulaması
- [ ] Privacy manifest (`PrivacyInfo.xcprivacy`) — Expo SDK 57 çoğunu üretir,
      üçüncü parti SDK'lar için doğrulanmalı

### Android — Google Play

- [x] Package: `com.gymentra.mobile`
- [x] Adaptive icon (foreground/background/monochrome)
- [x] Google Sign-In yapılandırıldı (SHA-1 + SHA-256 Firebase'e eklendi)
- [x] FCM V1 servis hesabı EAS'a yüklendi (push bildirimleri için)
- [x] Preview APK ile gerçek cihaz doğrulaması
- [ ] **`RECORD_AUDIO` izni kaldırılmalı** (P0-3)
- [ ] **Data Safety formu** — App Privacy ile birebir tutarlı doldurulmalı
- [ ] Play Console uygulama kaydı + içerik derecelendirme anketi
- [ ] Mağaza materyalleri: telefon ekran görüntüleri, 1024×500 feature
      graphic, kısa (80 kr.) ve uzun (4000 kr.) açıklama
- [ ] AAB (App Bundle) production build — mevcut `preview` profili APK üretiyor,
      Play Store AAB ister
- [ ] Hesap silme (P0-2) — Play'in de veri silme politikası var; ayrıca
      Play Console'da "hesap silme URL'i" alanı doldurulmalı
- [ ] Closed testing (kapalı test) — Play, yeni geliştirici hesapları için
      üretime çıkmadan önce test dönemi zorunlu kılıyor

### Her iki mağaza

- [ ] Sürüm numaralandırma stratejisi (`autoIncrement` production profilinde
      açık, `appVersionSource: remote`) — doğrulanmalı
- [ ] Çökme izleme (P5-2) yayından önce aktif olmalı
- [ ] Destek e-postası / iletişim kanalı belirlenmeli

---

## Önerilen sıra

1. **P0 tamamı** — mağaza reddini engeller (özellikle P0-1 ve P0-2 karar gerektirir).
2. **P1-1, P1-2, P1-3, P1-4** — gerçek veri sızıntısı ve enjeksiyon riskleri.
3. **P2-1, P2-2** — kullanıcının fark ettiği sessiz hatalar.
4. **P3-1** — sorgu limitleri; veri büyümeden ucuz, büyüdükten sonra pahalı.
5. **P5-1** (kural testleri) — bundan sonraki her kural değişikliğini güvence altına alır.
6. Kalanlar önceliklendirilerek.

---

## RM göç kaydı — 19 Ağustos 2026

Production'a uygulandı ve simülatörde uçtan uca doğrulandı.

**Kod**
- `types.ts` → `roles: MembershipRole[]` + `permissions: MembershipPermission[]`.
- `convert.ts` → `roles ?? (role ? [role] : [])` — eski dokümanlar çalışmaya
  devam ediyor.
- `src/data/membership.ts` (yeni) → yetenek yardımcıları. Ekranlardaki **tüm**
  ham `role === '...'` karşılaştırmaları kaldırıldı.
- Yazma tarafı geçiş boyunca **iki şekli birden** yazıyor (`roles` + `role`),
  böylece kurulu eski build'ler bozulmuyor.
- Sorgular `array-contains`'e geçti.

**RM-4 — kapatılan mevcut hata:** `trainer/index` (Üyeler) ve
`trainer/profile` `role === 'trainer'` şartı koşarken `trainer/programs` ve
`trainer/calendar` admin'i kabul ediyordu; yönetici ayarlardan takvime
girdiğinde "Üyeler" sekmesi kilitli geliyordu. Artık ikisi de `isStaff`.

**Kurallar** — `membershipRoles()` her iki şekli okuyor; `canCheckIn()`
eklendi ve `checkins` kuralı ona bağlandı; membership update artık
`roles`/`permissions` atamasına izin veriyor ama **yönetici kendi admin
rolünü düşüremiyor** (salonu yönetimsiz bırakmasın).

**Doğrulama** — `npm run test:rules` **51/51**, 9'u yeni rol testi:
legacy tek-rol dokümanı, sahip+antrenör bileşimi, düz antrenörün check-in
yapamaması, devredilmiş yetkiyle yapabilmesi ama ödeme defterine
erişememesi, antrenörün kendine yetki verememesi, yöneticinin atayabilmesi,
son yöneticinin rolünü düşürememesi, yetkinin salonlar arası sızmaması,
askıya alınmış üyeliğin hiçbir şey vermemesi.

**Backfill** — 13 doküman, idempotent (ikinci çalıştırmada 0 güncelleme).
`role` alanı **bilerek silinmedi**; tüm istemciler güncellendikten sonra
ayrı bir pasta temizlenecek.

### [x] RM-10 · Üyelik değişiklikleri canlı yayılmıyordu

RM-5'i doğrularken çıktı: `AuthContext` üyeliği **tek seferlik**
(`getActiveMembership`) okuyordu. Yönetici resepsiyondaki antrenöre check-in
yetkisi verdiğinde, antrenörün uygulaması bunu ancak **tam yeniden
başlatmadan sonra** görüyordu — yani RM-2/RM-6'nın asıl kullanım senaryosu
("çıkıyorum, kapıya sen bak") pratikte çalışmıyordu.

**Çözüldü.** `AuthContext` artık üyelik dokümanına `watchMembership` ile
abone. Rol/yetki değişimi ve **askıya alma** anında yansıyor; önbellek de
her değişimde tazeleniyor.

Simülatörde doğrulandı: uygulama açıkken Firestore'dan admin rolü
kaldırıldığında rol değiştirici anında kayboldu.

### [x] RM-11 · Yetki verildi ama antrenörün ekrana ulaşacağı yol yoktu

Kullanıcı bildirdi: yönetici antrenöre üye kabulü yetkisi verdi, antrenör
çıkıp girdi, check-in ekranı açılmadı.

**Sebep — RM-2/RM-6'daki eksiğim.** Yetkiyi güvenlik kuralında ve ekran
korumasında verdim ama **navigasyonu hiç eklemedim**:
- `/admin/checkin` yalnızca admin panelinden (`admin/index.tsx`) linkliydi.
- Antrenörün sekme çubuğunda check-in yoktu.
- Admin paneli `canManageGym` ile korunduğu için antrenör oraya da giremiyordu.
- Üstelik ekran hâlâ `admin/` route grubunun altındaydı; antrenör oraya
  gitseydi kilitli admin sekme çubuğunu görecekti.

Veri tarafı doğruydu (`permissions: ['checkin']` yazılmıştı) — sorun tamamen
erişilebilirlikti. Özellik uçtan uca hiç test edilememişti.

**Çözüldü.**
- `src/app/admin/checkin.tsx` → **`src/app/checkin.tsx`**. Check-in artık role
  değil yetkiye bağlı olduğu için hiçbir rolün sekme grubuna ait değil; kök
  Stack'te paylaşılan bir rota.
- Antrenörün ana ekranına (`trainer/index`) **yalnızca `canCheckIn` doğruysa**
  görünen "Giriş kabul et" kartı eklendi. Kapıda çalışan biri için sık ve
  zaman kritik bir eylem olduğundan profil sekmesine gömülmedi.
- Admin panelindeki kart yeni yola bağlandı.
- Geri butonu `safeBack(router, '/')` — doğrudan deep-link ile açıldığında da
  kullanıcıyı kendi rolünün ana ekranına götürüyor.

Simülatörde antrenör hesabıyla doğrulandı: yetki verilince kart çıkıyor.

---

## WEB — marte06 web uygulamasının kapatılması (19 Ağustos 2026)

Kullanıcı kararı: web uygulaması kapatılacak, **üyeler** GymEntra'ya
taşınacak; dersler, paketler ve üyelik atamaları taşınmayacak.

### [x] WEB-1 · Legacy veri arşivlendi
`marte06/archive/marte06-legacy/` — 7 koleksiyon, **224 doküman** JSON olarak
dışa aktarıldı (members 51, lessons 146, packages 5, assigned_packages 9,
payments 9, settings 1, branches 3).

⚠️ Arşiv düz metin şifre içerdiği için `.gitignore`'a eklendi ve
commit edilmiyor.

### [x] WEB-2 · Üyeler GymEntra'ya taşındı
51 legacy üyeden **50'si** `tenant_memberships/tarabya-marte_{uid}` olarak
oluşturuldu: `roles: ['member']`, `status: 'active'`, denormalize ad/e-posta,
tekil 6 haneli kısa kod, `requestedAt`/`approvedAt` orijinal `createdAt`'ten.
İzlenebilirlik için `migratedFromMemberId` alanı eklendi.

Script idempotent yazıldı (deterministik doküman kimliği + mevcut üyelikleri
atlama), yeniden çalıştırıldığında 0 değişiklik yaptığı doğrulandı.

Salon şimdi: **51 üye, 3 yönetici, 2 antrenör** — kısa kod çakışması yok.

**Taşınamayan 1 kayıt:** *Baran Demir* (`WzHcQOIGhzx8f2Ln9xFX`,
demirbarannn10@gmail.com) — Firebase Auth hesabı yok, üyelik dokümanı uid ile
anahtarlandığı için oluşturulamıyor. Ona hesap açmak diğer 50'de olduğu gibi
düz metin şifre üretmek anlamına geleceğinden **bilerek yapılmadı**; salon
kodu (`TARABYA-01`) ile kendisi katılmalı.

### [x] WEB-3 · Düz metin şifreler silindi
Arşivi alırken bulundu: `members` koleksiyonunda **36 kayıtta
`tempPassword`, 6 kayıtta `portalPassword`** açık metin duruyordu. Üye kendi
dokümanını okuyabildiği için kendi şifresini de okuyabiliyordu; yöneticinin
oturumu ele geçirilse 42 kullanıcının (muhtemelen başka yerlerde de
kullandığı) şifresi açığa çıkardı.

42 dokümandan iki alan da silindi, kalmadığı doğrulandı. Auth hesapları
etkilenmedi — kimse giriş yeteneğini kaybetmedi.

### [x] WEB-4 · Site yayından kaldırıldı
`firebase hosting:disable --site tarabyamarte`. `https://tarabyamarte.web.app`
artık HTTP 404 dönüyor. **Geri dönüşlü:** `firebase deploy --only hosting`
ile tekrar yayına alınır. Kod, veri ve kurallar etkilenmedi.

### [ ] WEB-5 · Legacy koleksiyon ve kural temizliği (sonraki adım)
Site kapalı ama legacy koleksiyonlar (`members`, `lessons`, `packages`,
`assigned_packages`, legacy `payments`, `settings`, `branches`) ve onlara ait
güvenlik kuralları duruyor. Bir süre gözlemledikten sonra:
- Kurallardaki legacy blokları ve `isAdmin()` bağımlılığı kaldırılabilir.
- `payments` ayıracı (`!('tenantId' in ...)`) gereksiz kalır; GymEntra
  ledger'ı tek sahip olur (bkz. P1-2 içindeki `gym_payments` notu).
- `createAuthUserOnNewMember` Cloud Function'ı artık tetiklenmeyecek,
  kaldırılabilir.
Acele edilmemeli — arşiv alındı ama geri dönüş kolaylığı için veri yerinde
bırakıldı.

### [ ] WEB-6 · Göç edilen üyelerde veri kalitesi sorunları

Göç sonrası uygulamada görüldü: bazı legacy kayıtlar tek bir `name` alanına
birden çok kişi yazılmış (ör. *"Gonca, Zeyneb Erva, Elif Sena, Ecrin…"*).
Muhtemelen web tarafında grup/aile kaydı olarak kullanılmış.

Bunlar artık ayrı ayrı GymEntra üyeliği olarak görünmüyor; tek bir üyelik ve
tek bir QR kodu paylaşıyorlar. Salon sahibiyle konuşulup ya ayrı üyeliklere
bölünmeli ya da bilinçli olarak böyle bırakıldığı not edilmeli.

### [x] UX-1 · Üyenin "Dersler" ekranında takvim yok

Antrenörün Takvim ekranı ay ızgarası + gün seçimi + seçili günün kompakt
listesi olarak yeniden yazıldı (RM öncesi iş). Üyenin `member/classes.tsx`
ekranı hâlâ **düz bir liste**: `watchClassesForTenant` ile gelen dersler
tarih gruplaması olmadan alt alta diziliyor, üye "yarın ne var?" sorusunu
kaydırarak aramak zorunda.

**İstenen:** antrenör takvimiyle aynı desen —
- Ay ızgarası, bugün otomatik seçili
- Dersi olan günlerde nokta göstergesi
- Seçili günün dersleri altta listelensin
- Başka gün seçilince o günün dersleri gelsin
- "Bugüne dön" kısayolu

**Uygulama notu:** `trainer/calendar.tsx` içindeki takvim mantığı
(`monthCells`, `dayKey`, `isSameDay`, ay gezinme, nokta sayımı) birebir aynı
işi yapıyor. İki ekrana kopyalanmak yerine **paylaşılan bir
`MonthCalendar` bileşenine** çıkarılmalı; aksi halde iki kopya zamanla
birbirinden ayrışır.

Ayrıca `watchClassesForTenant` şu an sınırsız dinliyor — takvim ay bazlı
olacağı için antrenör takviminde yapıldığı gibi **tarih penceresine
bağlanmalı** (`range`), yoksa salonun tüm ders geçmişi her açılışta
okunur.

### [x] UX-2 · Antrenörün üye listesi kaydırılamıyor

`src/app/trainer/index.tsx` — liste **hiçbir kaydırma kabına sarılmamış**;
`<ListGroup>` doğrudan sabit bir `<View style={{ flex: 1 }}>` içinde
render ediliyor. Kardeş ekran `trainer/programs.tsx` aynı listeyi
`ScrollView` içinde gösteriyor, yani tutarsızlık da var.

Test verisiyle 7 üye ekrana sığdığı için görünmüyordu. Legacy göçten sonra
salonun **51 üyesi** olunca ortaya çıktı: ilk ~13 üyeden sonrası tamamen
erişilemez.

**Düzeltme:** listeyi kaydırılabilir hale getir. 51+ satır için `ScrollView`
yerine **`FlatList`** tercih edilmeli — tüm satırları birden render etmek
yerine görünenleri render eder, salon büyüdükçe fark açılır.

Dikkat: `+ Giriş kabul et` kartı ve filtre çipleri kaydırma alanının
**dışında** kalmalı (sabit başlık), yoksa sık kullanılan check-in kısayolu
listeyle birlikte yukarı kayıp kaybolur.

**Aynı sınıf hatayı diğer ekranlarda da kontrol et:** `admin/members.tsx`,
`admin/payments.tsx`, `admin/staff.tsx` ve `trainer/member.tsx` — veri
büyüdüğünde hangileri taşıyor?

### [x] UX-3 · Check-in onay ekranı kötü görünüyor ve akışı kesiyor

`src/app/checkin.tsx` — başarılı taramadan sonraki sonuç bloğu. Ekran
görüntüsünde tek parça dev yeşil bir alan, ortasında küçük yazı ve
tanımsız bir üçgen çıkıyor.

**Dört ayrı sorun:**

1. **`flex: 1` sonuç kartını tüm ekrana yayıyor.** Kompakt bir onay kartı
   olması gerekirken kenardan kenara düz bir yeşil blok oluşuyor.
2. **`✓` karakteri 48pt'de doğru render edilmiyor** — ekranda ince beyaz bir
   üçgen olarak görünüyor (Inter fontunda o glif yok). Antrenman ekranındaki
   play/pause'da yapıldığı gibi **Ionicons** kullanılmalı.
3. **"Yeni tarama" butonu görünmüyor.** `critical` varyantı dolu birincil
   renk kullanıyor, arka plan da `colors.p` — yeşil üstüne yeşil, düz yazı
   gibi duruyor. Yeşil zeminde kontrast veren bir varyant gerekiyor.
4. **Akış kesiliyor.** Resepsiyonda personel arka arkaya onlarca kişi
   okutuyor; her seferinde tam ekran onay + elle "Yeni tarama" dokunuşu
   gereksiz sürtünme. Kısa bir onay gösterip (~1.5 sn) **otomatik olarak
   taramaya dönmeli**, başarıda haptic geri bildirim verilmeli. Hata
   durumunda ise ekranda kalmalı — personelin okuması gerekir.

**Not:** aynı blok hata durumunu da render ediyor; düzeltme ikisini de
kapsamalı. Başarı ve hata görsel olarak bir bakışta ayrılmalı (renk +
ikon), çünkü personel ekrana bakmadan da akışı sürdürmeye çalışacak.

---

## Cihaz testi bulguları — 19 Ağustos 2026

Kullanıcının iOS build üzerinde yaptığı incelemeden çıkanlar.

### [x] DEV-1 · `workout_logs` sorgusu index'siz kalmış (loglardan yakalandı)
P2-1'de eklenen `watch.ts` sarmalayıcısı işe yaradı: Metro loglarında
`Antrenman geçmişi aboneliği düştü: failed-precondition — The query requires
an index` görüldü.

Sorgu `orderBy('startedAt','desc')` kullanıyordu ama deploy edilmiş index
yalnızca `ASCENDING`'di — Firestore'da **sıralama yönü index'in parçasıdır**.
Üyenin Gelişim ekranındaki antrenman özeti ve antrenörün üye detay ekranı
sessizce boş kalıyordu.

`(tenantId, memberId, startedAt DESC)` index'i eklenip deploy edildi.

### [x] DEV-2 · Panel kartları tıklanamıyor + iki kart uydurma veri gösteriyordu
- Check-in sayacı `/checkin` tarayıcısına gidiyordu — sayının **arkasındaki
  listeye** değil. Yeni `admin/today.tsx`: bugün girenler, saatiyle birlikte.
  (Check-in kayıtları yalnızca uid tutuyor; isimler üye listesinden burada
  birleştiriliyor, her tarama dokümanına denormalize edilmiyor.)
- **"7 paketi bitiyor" ve "84B₺ bu ay gelir" sabit yazılmış uydurma
  değerlerdi.** Sırasıyla gerçek bekleyen istek sayısı ve bu ayın onaylanmış
  ödeme toplamıyla değiştirildi.
- Üç kartın hepsi artık ilgili ekrana götürüyor.

### [x] DEV-3 · Admin "Üyeler" sekmesi üyeleri göstermiyordu
Ekran yalnızca `watchPendingRequests` dinliyordu; sekme "Üyeler" adını
taşımasına rağmen **onay kuyruğuydu**. 51 üyesi ve 0 bekleyen isteği olan
salon boş görünüyordu — kullanıcının "ödemelerde üye var ama üyeler ekranında
yok" gözlemi tam olarak buydu.

Aktif üye listesi eklendi (giriş koduyla birlikte), ekran kaydırılabilir
yapıldı ve boş-durum metni düzeltildi.

### [x] DEV-4 · Salon ayarlarından antrenör ekranına düşme
`admin/settings.tsx` "Antrenör takvimleri" satırı `/trainer/calendar`'a
push ediyordu — `trainer/` rota grubuna girmek **tüm sekme çubuğunu**
değiştiriyordu. Yönetici salon ayarlarında gezerken bir anda antrenör
arayüzünde buluyordu kendini; profil hâlâ "admin" diyordu çünkü rol
değişmemişti, **navigasyon** değişmişti.

Check-in ekranındakiyle aynı sınıf hata. Yeni `admin/calendar.tsx` rotası
aynı takvim görünümünü (`TrainerCalendarView` export edildi) yöneticinin
kendi sekme çubuğu içinde render ediyor.

### [x] DEV-5 · "Ekip ve yetkiler" ilk girişte hata veriyordu
Loglardaki `permission-denied` ve `[auth] üyelik yenilenemedi` satırlarıyla
eşleşiyor. Sebep: P1-6'da küresel `admin` claim'ini GymEntra kurallarından
kaldırdım ama `tarkan.cicek@gmail.com` hesabının **hiçbir salonda üyeliği
yoktu** — o pencerede hesap tüm GymEntra verisine erişimini kaybetti.
Hesaba `tarabya-marte`'de admin üyeliği oluşturulunca çözüldü.

Doğrulama için hedefli bir kural testi yazıldı: admin, kiracı geneli
`checkins` sorgusunu çalıştırabiliyor; düz üye çalıştıramıyor.

### [x] UX-1 uygulandı — ortak `MonthCalendar`

Takvim mantığı `src/components/MonthCalendar.tsx` bileşenine çıkarıldı
(ay ızgarası, gün seçimi, ay gezinme, nokta göstergeleri + `startOfDay`,
`isSameDay`, `dayKey` yardımcıları). **Antrenör takvimi de bu bileşene
geçirildi** — kopyalanmadı, ikisi tek kaynağı kullanıyor.

Üyenin Dersler ekranı yeniden yazıldı: bugün otomatik seçili, dersli günlerde
nokta, altta seçili günün dersleri, "Bugüne dön" kısayolu, hata durumu.

**Sorgu sınırlandırıldı:** `watchClassesForTenant` artık zorunlu bir
`range` alıyor. Üç çağrı yeri de kendi penceresini veriyor — üye takvimi
±1 hafta paylı ay, üye ana ekranı yalnızca bugün, yönetici ders yönetimi
ayın başından itibaren 3 ay. Öncesinde tüm gelecek dersler `limit(100)` ile
çekiliyordu.

---

### [x] DEV-6 · Yetki ekranları çıkışsız kilitli akıştı

Kullanıcı bildirdi: *"simülatör ekranında 'salon antrenör oturumu gerekli'
mesajı var ama çıkış (logout) imkanı vermiyor."*

11 ekran (`admin/{settings,members,calendar,payments,staff,classes}`,
`trainer/{index,calendar,member,programs,profile}`) yetki yoksa çıplak bir
kilit ikonu ve tek cümle basıyordu. Sekme çubuğu yalnızca aynı kilitli yüzeyin
ekranları arasında dolaştığı için, yanlış yüzeye düşen ya da üyeliği iptal
edilen kullanıcının ne geri dönüş yolu ne de oturum kapatma imkânı vardı —
AGENTS.md §2'nin açıkça yasakladığı kilitli akış.

**Çözüm:** Ortak `components/AccessGuard.tsx`. İki çıkış yolu sunuyor:
üyelik *bir* rol veriyorsa "Ana ekranıma dön" (`primaryRole` → `ROLE_HOME`),
ve her durumda `confirmDestructive` onaylı "Çıkış yap". 11 ekranın hepsi buna
geçirildi; iki ekrandaki açıklama metni `hint` olarak korundu.

Yan düzeltmeler: `ROLE_HOME` artık `Record<MembershipRole, Href>` — üç
çağrı yerindeki `as never` kaçamağı kalktı. `AccessGuard` bilerek `<Screen>`
sarmıyor: rol layout'ları zaten bir tane render ediyor ve
`react-native-safe-area-context` iç içe geçtiğinde üst inset'i iki kez
uyguluyor.

Görsel olarak simülatörde doğrulandı (buton render oluyor); onay diyaloğu
simülatörde dokunma kaydedilmediği için **tıklanarak doğrulanmadı**.

## [~] VC-1 · **GymEntra hiçbir sürüm kontrolünde değil** ⚠️

P5-5 (CI/CD) için depoya bakarken çıktı ve CI'dan çok daha acil:

```
$ git status --short | grep gymentra
?? gymentra-mobile/
?? gymentra-site/
```

`gymentra-mobile/` ve `gymentra-site/` **hiçbir git deposunda takip
edilmiyor**. Bu oturumda yazılan her şey — rol modeli, takvimler, güvenlik
düzeltmeleri, göç script'leri — yalnızca bu diskte duruyor. Yedek yok, geçmiş
yok, bozulan bir değişikliği geri alma imkânı yok.

**Depo durumu**
| Depo | Durum |
|---|---|
| `Marte/.git` (MarteSporManagement) | Son commit **1 yıl önce**, 21.295 bekleyen değişiklik (çoğu `gym-management/node_modules` silmesi). Terk edilmiş. `gymentra-mobile` içinde **0 dosya** takipli. |
| `marte06/.git` | Sağlıklı, 2 hafta önce commit'lenmiş. Bu oturumdaki kural/index/function değişikliklerim **commit edilmemiş** durumda. |

**İyi haber:** `gymentra-mobile/.gitignore` hazır ve doğru — `node_modules`,
`.expo`, imzalama anahtarları ve **`.env`** dışlanmış. Kaynak yalnızca
~1,2 MB (src + assets).

**Öneri**
1. `gymentra-mobile` için **kendi deposunu** başlat (dış repo'nun 21 bin
   değişiklikli hali temizlenmeden ona eklemek riskli).
2. `gymentra-site` de ayrı veya aynı depoda takibe alınsın.
3. `marte06`'daki bekleyen kural/function değişiklikleri commit'lensin.
4. **Bundan sonra** CI kurulsun (P5-5) — takip edilmeyen bir depoda CI
   anlamsız.

### Yapılanlar — 19 Ağustos 2026

- [x] `gymentra-mobile` kendi deposuna alındı:
      **https://github.com/SaltTechSolutions/gymentra-mobile** (private, `main`).
      126 dosya, ilk commit.

      Push öncesi sır denetimi yapıldı: `.env` dışlandı (uzakta olmadığı
      API ile doğrulandı), imzalama anahtarı yok, tüm dosyalarda
      `AIza…` / `-----BEGIN` / token taraması temiz. `.env.example` yalnızca
      boş şablon.

- [x] `gymentra-site` kendi deposuna alındı:
      **https://github.com/SaltTechSolutions/gymentra-site** (private, `main`).

- [x] `marte06`'daki bu oturuma ait değişiklikler commit'lendi (`4210f0c`):
      kurallar, indexler, `firebase.json` predeploy hook'u, Cloud Functions
      ve 1073 satırlık kural testi.

      **Yalnızca bu oturumun dosyaları** commit'lendi. Depoda 44 adet
      bana ait olmayan bekleyen değişiklik var (`src/App.tsx`, silinmiş
      `AppShell` dosyaları, design-system sayfaları) — yarım kalmış başka
      bir işle kendi değişikliğimi aynı commit'e karıştırmadım.

- [ ] **`marte06` push edilmedi.** Dal `refactor/mobile-ui`, origin'in
      4 commit önünde; bunların 3'ü bana ait değil. Push etmek onları da
      yayınlar — bu kullanıcının kararı.

- [x] CI kuruldu (P5-5).
