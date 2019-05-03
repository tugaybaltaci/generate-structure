import React from 'react';

const TestComponent = () => {
  return (
    <OtherComponent paramOne={variableOne} paramTwo={(variableTwo) => variableThree} />
  )
}

export default TestComponent;