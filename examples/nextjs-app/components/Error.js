import React from 'react';

export function Error({ message }) {
  return (
    <div className="alert alert-danger" role="alert">
      Oops... {message}
    </div>
  );
}
