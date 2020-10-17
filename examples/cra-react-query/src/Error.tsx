import React from 'react';

export function Error({ message }: { message: string }) {
  return (
    <div className="alert alert-danger" role="alert">
      Oops... {message}
    </div>
  );
}
