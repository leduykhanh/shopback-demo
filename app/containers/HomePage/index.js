/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 *
 * NOTE: while this component should technically be a stateless functional
 * component (SFC), hot reloading does not currently support SFCs. If hot
 * reloading is not a necessity for you then you can refactor it and remove
 * the linting exception.
 */

import React from 'react';
import { FormattedMessage } from 'react-intl';
import messages from './messages';
import Carousel from 'components/Carousel';

export default class HomePage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function

  render() {
    const boxStyle = {
     width: '100%',
     height: '300px',
     border: '1px solid black',
     background: '#ccc',
     padding: '20px',
     fontSize: '3em'
   };
    return (
      <h1>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '100%', display: 'inline-block' }}>
          <FormattedMessage {...messages.header} />
            <Carousel tolerance={100}>
                <div style={{ ...boxStyle, backgroundColor: 'red' }}>1</div>
                <div style={{ ...boxStyle, backgroundColor: 'green' }}>2</div>
                <div style={{ ...boxStyle, backgroundColor: 'yellow' }}>3</div>
                <div style={{ ...boxStyle, backgroundColor: 'blue' }}>4</div>
            </Carousel>
          </div>
        </div>
      </h1>
    );
  }
}
