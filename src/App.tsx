import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import routes from './constants/routes.json';
import AddNewEntryScreen from './scopes/feed/AddNewEntryScreen';
import FeedScreen from './scopes/feed/FeedScreen';
import ViewEntryScreen from './scopes/feed/ViewEntryScreen';
import LogEntriesProvider from './contexts/LogEntriesContext';

export default function App() {
  return (
    <Router>
      <LogEntriesProvider>
        <Switch>
          <Route path={`${routes.ENTRY}/:date`} component={ViewEntryScreen} />
          <Route path={routes.NEW} component={AddNewEntryScreen} />
          <Route path={routes.FEED} component={FeedScreen} />
        </Switch>
      </LogEntriesProvider>
    </Router>
  );
}
