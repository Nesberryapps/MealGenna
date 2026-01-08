import React from 'react';
import dynamic from 'next/dynamic';

const NoSsr = (props: { children: React.ReactNode }) => (
  <>{props.children}</>
);

export default dynamic(() => Promise.resolve(NoSsr), {
  ssr: false,
});