/**
*
* Carousel
*
*/

import React, { Children, Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import './scss/carousel.scss';

function getPosition(event) {
  if ('touches' in event) {
    const { pageX, pageY } = event.touches[0];
    return { x: pageX, y: pageY };
  }

  const { screenX, screenY } = event;
  return { x: screenX, y: screenY };
}

function CSSTranslate(position, axis) {
  const positionCss = (axis === 'horizontal') ? [position, 0, 0] : [0, position, 0];
  const transitionProp = 'translate3d';

  const translatedPosition = `(${positionCss.join(',')})`;
  return transitionProp + translatedPosition;
}

class Carousel extends Component { // eslint-disable-line react/prefer-stateless-function

  static defaultProps = {
    tolerance: 100,
  };

  constructor(props) {
    super(props);
    this.tolerance = props.tolerance;
    const { children } = this.props;
    const childrenCount = Children.count(children);
    this.childrenCount = childrenCount;
    this.state = {
      selectedItem: childrenCount,
      items: [].concat(children).concat(children).concat(children),
    };

    this.handleSwipeStart = this.handleSwipeStart.bind(this);
    this.handleSwipeMove = this.handleSwipeMove.bind(this);
    this.handleSwipeEnd = this.handleSwipeEnd.bind(this);

    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
  }

  componentDidMount() {
    if (this.list) {
      this.list.addEventListener('touchmove', this.handleSwipeMove);
      this.list.addEventListener('touchend', this.handleSwipeEnd);
      this.setState({
        itemSize: this.itemsRef[0].clientWidth,
      });
    }
  }

  componentWillUnmount() {
    if (this.list) {
      this.list.removeEventListener('touchmove', this.handleSwipeMove);
    }
  }

  setItemsRef(node, index) {
    if (!this.itemsRef) {
      this.itemsRef = [];
    }
    this.itemsRef[index] = node;
  }

  moveTo(position) {
    const firstPosition = this.childrenCount;
    const lastPosition = 2 * this.childrenCount - 1;
    let newPosition = position;

    if (position < firstPosition) {
      newPosition = lastPosition;
    }

    if (position > lastPosition) {
      newPosition = firstPosition;
    }

    this.setState({
      selectedItem: newPosition,
    });
  }

  onSwipeLeft(position) {
    this.moveTo(this.state.selectedItem + (typeof position === 'number' ? position : 1));
  }

  onSwipeRight(position) {
    this.moveTo(this.state.selectedItem - (typeof position === 'number' ? position : 1));
  }

  onMouseDown(event) {
    this.mouseDown = true;

    document.addEventListener('mouseup', this.onMouseUp);
    document.addEventListener('mousemove', this.onMouseMove);

    this.handleSwipeStart(event);
  }

  onMouseMove(event) {
    if (!this.mouseDown) {
      return;
    }

    this.handleSwipeMove(event);
  }

  onMouseUp(event) {
    this.mouseDown = false;

    document.removeEventListener('mouseup', this.onMouseUp);
    document.removeEventListener('mousemove', this.onMouseMove);

    this.handleSwipeEnd(event);
  }

  handleSwipeStart(event) {
    const { x, y } = getPosition(event);
    this.moveStart = { x, y };
    this.onSwipeStart(event);
  }

  handleSwipeMove(event) {
    if (!this.moveStart) {
      return;
    }
    const { x } = getPosition(event);
    const deltaX = x - this.moveStart.x;
    this.moving = true;

    const shouldPreventDefault = this.onSwipeMove(deltaX, event);

    if (shouldPreventDefault) {
      event.preventDefault();
    }

    this.deltaX = deltaX;
  }

  handleSwipeEnd(event) {
    const { tolerance } = this;
    if (this.moving) {
      if (this.deltaX < -tolerance) {
        this.onSwipeLeft(1, event);
      } else if (this.deltaX > tolerance) {
        this.onSwipeRight(1, event);
      }
    }
    this.onSwipeEnd(event);

    this.moveStart = null;
    this.moving = false;
    this.movePosition = null;
  }

  onSwipeStart() {
    this.setState({
      swiping: true,
    });
  }

  onSwipeEnd() {
    this.resetPosition();
    this.setState({
      swiping: false,
    });
  }

  onSwipeMove(deltaX) {
    const initialBoundry = 0;
    const currentPosition = this.getPosition(this.state.selectedItem);
    const finalBoundry = this.getPosition(Children.count(this.props.children) - 1);

    let handledDelta = deltaX;

    if (currentPosition === initialBoundry && deltaX > 0) {
      handledDelta = 0;
    }

    if (currentPosition === finalBoundry && deltaX < 0) {
      handledDelta = 0;
    }

    const position = currentPosition + (100 / (this.state.itemSize / handledDelta)) + '%';

    this.setPosition(position);

    const hasMoved = Math.abs(deltaX) > this.tolerance;

    return hasMoved;
  }


  getPosition(index) {
    return - index * 100;
  }

  resetPosition() {
    const currentPosition = this.getPosition(this.state.selectedItem) + '%';
    this.setPosition(currentPosition);
  }

  setPosition(position) {
    const { list } = this;
    [
      'WebkitTransform',
      'MozTransform',
      'MsTransform',
      'OTransform',
      'transform',
      'msTransform',
    ].forEach((prop) => {
      list.style[prop] = CSSTranslate(position, 'horizontal');
    });
  }

  renderItems() {
    return Children.map(this.state.items, (item, index) => {
      const slideProps = {
              ref: (e) => this.setItemsRef(e, index),
              key: 'itemKey' + index,
              className: `slide ${index === this.state.selectedItem ? 'selected' : ''}`,
            };
      return (
                <li {...slideProps}>
                  { item }
                </li>
            );
    });
  }

  render() {
    return (
      <div className="carousel">
        <div className="slider-wrapper axis-horizontal">
          <ul
            className="slider"
            onMouseDown={this.onMouseDown}
            onTouchStart={this.handleSwipeStart}
            onTouchEnd={this.handleSwipeEnd}
            ref={(node) => { this.list = node; }}>
            { this.renderItems() }
          </ul>
        </div>
      </div>
    );
  }
}

Carousel.propTypes = {
  children: PropTypes.node,
  tolerance: PropTypes.number,
};

export default Carousel;
