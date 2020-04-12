import React from 'react';
import { Text } from 'design-system';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="App-footer">
      <Text
        appearance="white"
        weight="strong"
      >
        &copy; Copyright { year } Sandesh Choudhary
      </Text>
    </footer>
  );
}

export default Footer;