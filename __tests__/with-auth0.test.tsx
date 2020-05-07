import '@testing-library/jest-dom/extend-expect';
import React, { Component } from 'react';
import withAuth0, { WithAuthProps } from '../src/with-auth0';
import { render, screen } from '@testing-library/react';

describe('withAuth0', () => {
  it('should wrap a class component', () => {
    class MyComponent extends Component<WithAuthProps> {
      render(): JSX.Element {
        return <>hasAuth: {`${!!this.props.auth}`}</>;
      }
    }
    const WrappedComponent = withAuth0(MyComponent);
    render(<WrappedComponent />);
    expect(screen.getByText('hasAuth: true')).toBeInTheDocument();
  });
});
