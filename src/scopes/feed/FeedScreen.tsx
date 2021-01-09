import { isAfter, format, getDay, parse, startOfWeek } from 'date-fns';
import { toDate } from 'date-fns-tz';
import enUs from 'date-fns/locale/en-US';
import React, { useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { Link, useHistory } from 'react-router-dom';

import TopMenu from '../../components/TopMenu';
import { useLogEntries } from '../../contexts/LogEntriesContext';
import { Entry } from './types';

const locales = {
  'en-US': enUs,
};

const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

function FeedScreen() {
  const history = useHistory();
  const { entries } = useLogEntries();
  const events = useMemo(() => {
    return entries?.map((entry) => {
      return {
        title: entry.title,
        start: toDate(`${entry.date} ${localTimezone}`),
        end: toDate(`${entry.date} ${localTimezone}`),
        allDay: true,
      };
    });
  }, [entries]);

  const ColoredDateCellWrapper = ({ children, value }) => {
    const isInFuture = isAfter(value, new Date());
    let style = {};
    if (isInFuture) {
      style = {
        backgroundColor: '#e6e6e6',
      };
    }
    return React.cloneElement(React.Children.only(children), {
      style,
    });
  };

  return (
    <div>
      <TopMenu canGoBack={false} />
      <div style={{ flex: 1 }}>
        <span>Feed</span>
        <Calendar
          localizer={localizer}
          events={events || []}
          views={['month']}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
          selectable
          onSelectSlot={(e) => {
            const slot = e.slots[0];
            const slotAsDate = new Date(slot);
            const entryDate = format(slotAsDate, 'yyyy-MM-dd');
            const selectedEntries = entries?.filter(
              (entry: Entry) => entry.date === entryDate
            );

            if (isAfter(slotAsDate, new Date())) return;

            if (!selectedEntries?.length) {
              history.push({
                pathname: `/new`,
                state: { date: entryDate },
              });
            } else {
              history.push({
                pathname: `/entry/${entryDate}`,
                state: { entries: selectedEntries },
              });
            }
          }}
          onSelectEvent={(e) => {
            const { start } = e;
            const startAsDate = new Date(start);
            if (isAfter(startAsDate, new Date())) return;

            const entryDate = format(startAsDate, 'yyyy-MM-dd');
            const selectedEntries = entries?.filter(
              (entry: Entry) => entry.date === entryDate
            );
            history.push({
              pathname: `/entry/${entryDate}`,
              state: { entries: selectedEntries },
            });
          }}
          components={{
            dateCellWrapper: ColoredDateCellWrapper,
          }}
        />
      </div>
      <div>
        <Link to="/new">Add New Entry</Link>
      </div>
    </div>
  );
}

export default FeedScreen;
