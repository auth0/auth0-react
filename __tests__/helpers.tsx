import React, { PropsWithChildren } from 'react';
import Auth0Provider, { Auth0ProviderOptions } from '../src/auth0-provider';

export const createWrapper = ({
  clientId = '__test_client_id__',
  domain = '__test_domain__',
  ...opts
}: Partial<Auth0ProviderOptions> = {}) => {
  return function Wrapper({
    children,
  }: PropsWithChildren<Record<string, unknown>>): JSX.Element {
    return (
      <Auth0Provider domain={domain} clientId={clientId} {...opts}>
        {children}
      </Auth0Provider>
    );
  };
};

export interface Defer<TData> {
  resolve: (value: TData | PromiseLike<TData>) => void;
  reject: (reason?: unknown) => void;
  promise: Promise<TData>;
}

export function defer<TData>() {
  const deferred: Defer<TData> = {} as unknown as Defer<TData>;

  const promise = new Promise<TData>(function (resolve, reject) {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });

  deferred.promise = promise;
  return deferred;
}
