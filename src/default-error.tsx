import React from 'react';

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
    backgroundColor: '#f8f8f8',
    color: '#333',
    textAlign: 'center' as const,
    padding: '20px',
  },
  content: {
    padding: '40px',
    borderRadius: '8px',
    backgroundColor: '#fff',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: '24px',
    fontWeight: 600,
    margin: '0 0 10px 0',
  },
  message: {
    fontSize: '16px',
    margin: '0',
  },
};

/**
 * @ignore
 */
export const DefaultErrorComponent = (): React.JSX.Element => (
  <div style={styles.container}>
    <div style={styles.content}>
      <h1 style={styles.title}>Access Denied</h1>
      <p style={styles.message}>
        You do not have the required permissions to access this page.
      </p>
    </div>
  </div>
);
