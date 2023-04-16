import React from 'react';
import { render, screen } from '@testing-library/react';
import AppGx from './AppGx';

test('renders learn react link', () => {
  render(<AppGx ><span>hello</span></AppGx>);
  const linkElement = screen.getByText(/hello/i);
  expect(linkElement).toBeInTheDocument();
});
