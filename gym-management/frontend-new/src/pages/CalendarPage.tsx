import { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
// date-fns kullanımı için importlar kaldırıldı

interface CalendarEvent {
  id: string;
  title: string;
  start: Date | string;
  end: Date | string;
  allDay?: boolean;
  extendedProps: {
    trainer?: string;
    capacity?: number;
    registered?: number;
    notes?: string;
  };
}

export const CalendarPage = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [view, setView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'>('dayGridMonth');

  // Takvim görünümünü değiştirme
  const handleViewChange = (newView: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay') => {
    setView(newView);
  };

  // Takvim üzerinde tarih seçildiğinde
  const handleDateSelect = (selectInfo: any) => {
    const title = 'Yeni Ders';
    const calendarApi = selectInfo.view.calendar;

    calendarApi.unselect(); // tarih seçimini temizle

    // Yeni etkinlik oluştur
    const newEvent: CalendarEvent = {
      id: String(new Date().getTime()),
      title,
      start: selectInfo.start,
      end: selectInfo.end,
      allDay: selectInfo.allDay,
      extendedProps: {
        trainer: '',
        capacity: 10,
        registered: 0,
        notes: ''
      }
    };

    setEvents([...events, newEvent]);
  };

  // Etkinlik tıklandığında
  const handleEventClick = (clickInfo: any) => {
    // TODO: Etkinlik detaylarını gösterecek modal açılacak
    console.log('Event clicked:', clickInfo.event);
  };

  // Etkinlik sürüklendiğinde veya yeniden boyutlandırıldığında
  const handleEventChange = (changeInfo: any) => {
    // TODO: Etkinlik güncellemesi yapılacak
    console.log('Event changed:', changeInfo.event);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Ders Takvimi</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => handleViewChange('dayGridMonth')}
            className={`px-3 py-1 rounded-md ${
              view === 'dayGridMonth' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Ay
          </button>
          <button
            onClick={() => handleViewChange('timeGridWeek')}
            className={`px-3 py-1 rounded-md ${
              view === 'timeGridWeek' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Hafta
          </button>
          <button
            onClick={() => handleViewChange('timeGridDay')}
            className={`px-3 py-1 rounded-md ${
              view === 'timeGridDay' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Gün
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={view}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: ''
          }}
          locale="tr"
          firstDay={1} // Hafta başlangıcı Pazartesi
          buttonText={{
            today: 'Bugün',
            month: 'Ay',
            week: 'Hafta',
            day: 'Gün',
          }}
          height="auto"
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          events={events}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventChange={handleEventChange}
          eventContent={renderEventContent}
          slotLabelFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }}
          slotMinTime="06:00:00"
          slotMaxTime="23:00:00"
          allDaySlot={false}
        />
      </div>
    </div>
  );
};

// Özel etkinlik içeriği render fonksiyonu
function renderEventContent(eventInfo: any) {
  return (
    <div className="p-1 text-xs">
      <div className="font-medium truncate">{eventInfo.timeText} - {eventInfo.event.title}</div>
      {eventInfo.event.extendedProps.trainer && (
        <div className="text-gray-600 truncate">{eventInfo.event.extendedProps.trainer}</div>
      )}
      <div className="flex justify-between mt-1">
        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
          {eventInfo.event.extendedProps.registered || 0}/{eventInfo.event.extendedProps.capacity || 0}
        </span>
      </div>
    </div>
  );
}

export default CalendarPage;
