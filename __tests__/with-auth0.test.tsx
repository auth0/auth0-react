import '@testing-library/jest-dom/extend-expect';
import React, { Component } from 'react';
import withAuth0, { WithAuth0Props } from '../src/with-auth0';
import { render, screen } from '@testing-library/react';

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
});
