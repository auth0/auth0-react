import '@testing-library/jest-dom/extend-expect';
import React, { Component } from 'react';
import withAuth0, { WithAuth0Props } from '../src/with-auth0';
import { render, screen } from '@testing-library/react';
import { Auth0ContextInterface, initialContext } from '../src/auth0-context';

describe('withAuth0', () => {
  it('should wrap a class component', () => {
    class MyComponent extends Component<WithAuth0Props> {
      render(): JSX.Element {
        return <>hasAuth: {`${!!this.props.auth0}`}</>;
      }
    }
    const WrappedComponent = withAuth0(MyComponent);
    render(<WrappedComponent />);
    expect(screen.getByText('hasAuth: true')).toBeInTheDocument();
  });

  it('should wrap a class component and provide context', () => {
    const context = React.createContext<Auth0ContextInterface>(initialContext);
    class MyComponent extends Component<WithAuth0Props> {
      render(): JSX.Element {
        return <>hasAuth: {`${!!this.props.auth0}`}</>;
      }
    }
    const WrappedComponent = withAuth0(MyComponent, context);
    render(<WrappedComponent />);
    expect(screen.getByText('hasAuth: true')).toBeInTheDocument();
  });
});
