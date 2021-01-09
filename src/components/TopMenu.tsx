/* eslint-disable react/prop-types */
import React from 'react';
import { useHistory } from 'react-router-dom';

export default function TopMenu({ canGoBack = true, children }): JSX.Element {
  const history = useHistory();
  return (
    <div data-tid="top-menu">
      {canGoBack && (
        <button type="button" onClick={() => history.goBack()}>
          Go Back
        </button>
      )}
      {children}
    </div>
  );
}
