import React, { ReactNode } from 'react';
import LogEntriesProvider from '../contexts/LogEntriesContext';

type Props = {
  children: ReactNode;
};

export default function App(props: Props) {
  const { children } = props;
  return <LogEntriesProvider>{children}</LogEntriesProvider>;
}
