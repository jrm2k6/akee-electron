/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useRef } from 'react';

function useListener(ref, eventName, handler) {
  useEffect(() => {
    if (ref.current) {
      const element = ref.current;
      element.addEventListener(eventName, handler);
      return () => element.removeEventListener(eventName, handler);
    }

    return () => {};
  }, [eventName, handler, ref]);
}

export default function DatePicker(props: {
  onChange: any;
  onFocus: any;
  onBlur: any;
  dateAdapter: any;
  localization: any;
}) {
  const ref = useRef(null);
  const { onChange, onFocus, onBlur, dateAdapter, localization } = props;

  useListener(ref, 'duetChange', onChange);
  useListener(ref, 'duetFocus', onFocus);
  useListener(ref, 'duetBlur', onBlur);

  useEffect(() => {
    if (ref.current) {
      ref.current.localization = localization;
      ref.current.dateAdapter = dateAdapter;
    }
  }, [localization, dateAdapter]);

  return <duet-date-picker ref={ref} {...props} />;
}
