import { Button, Result } from 'antd';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const LinkExpired = () => {
  const navigate = useNavigate();
  return (
    <Result status="warning"
      title="O link que tentou aceder expirou!">
    </Result>);
};
export default LinkExpired;