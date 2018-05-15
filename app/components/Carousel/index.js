/**
*
* Carousel
*
*/

import React, { Children, Component } from 'react';
import ReactDOM from 'react-dom';
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

    const translatedPosition = '(' + positionCss.join(',') + ')';
    console.log("CSSTranslate", position)
    // console.log("CSSTranslate", transitionProp + translatedPosition)
    return transitionProp + translatedPosition;
};

class Carousel extends Component { // eslint-disable-line react/prefer-stateless-function

  static defaultProps = {
    centerMode: false,
    centerSlidePercentage: 100
  };

  constructor(props) {
    super(props);
    this.tolerance = 100;
    let { children } = this.props;
    let childrenCount = Children.count(children);
    this.childrenCount = childrenCount;
    this.state = {
      selectedItem: childrenCount,
      items: [].concat(children).concat(children).concat(children),
    };

    this._handleSwipeStart = this._handleSwipeStart.bind(this);
    this._handleSwipeMove = this._handleSwipeMove.bind(this);
    this._handleSwipeEnd = this._handleSwipeEnd.bind(this);

    this._onMouseDown = this._onMouseDown.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);
  }

  componentDidMount() {
    this.setState({
      itemSize : this.itemsRef[0].clientWidth,
    });
  }

  setItemsRef(node, index) {
        if (!this.itemsRef) {
            this.itemsRef = [];
        }
        this.itemsRef[index] = node;
    }

  resetItems(position) {

  }

  moveTo(position) {
        console.log("position", position);
        console.log("this.mouseDown ", this.mouseDown );
        const firstPosition = this.childrenCount;
        const lastPosition = 2 * this.childrenCount - 1;

        if (position < firstPosition ) {
          position = lastPosition;
        }

        if (position > lastPosition) {
          position = firstPosition;
        }

        this.setState({
            selectedItem: position
        });
    }

  onSwipeLeft(position, event) {
    this.moveTo(this.state.selectedItem + (typeof position === 'Number' ? positions : 1));
  }

  onSwipeRight(position, event) {
    this.moveTo(this.state.selectedItem - (typeof position === 'Number' ? positions : 1));
  }

  _onMouseDown(event) {
    this.mouseDown = true;

    document.addEventListener('mouseup', this._onMouseUp);
    document.addEventListener('mousemove', this._onMouseMove);

    this._handleSwipeStart(event);
  }

  _onMouseMove(event) {
    if (!this.mouseDown) {
      return;
    }

    this._handleSwipeMove(event);
  }

  _onMouseUp(event) {
    this.mouseDown = false;

    document.removeEventListener('mouseup', this._onMouseUp);
    document.removeEventListener('mousemove', this._onMouseMove);

    this._handleSwipeEnd(event);
  }

  _handleSwipeStart(event) {
    const { x, y } = getPosition(event);
    this.moveStart = { x, y };
    this.onSwipeStart(event);
  }

  _handleSwipeMove(event) {
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

  _handleSwipeEnd(event) {

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
            swiping: true
        });
    }

    onSwipeEnd() {
        this.resetPosition();
        this.setState({
            swiping: false
        });
        ;
    }

    onSwipeMove(deltaX) {

        const initialBoundry = 0;

        const currentPosition = this.getPosition(this.state.selectedItem);
        console.log("currentPosition", currentPosition);
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

    resetPosition = () => {
        const currentPosition = this.getPosition(this.state.selectedItem) + '%';
        this.setPosition(currentPosition);
    }

    setPosition = (position) => {
        const list = ReactDOM.findDOMNode(this.listRef);
        [
            'WebkitTransform',
            'MozTransform',
            'MsTransform',
            'OTransform',
            'transform',
            'msTransform'
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
            onMouseDown={ this._onMouseDown }
            onTouchStart={ this._handleSwipeStart }
            onTouchEnd={ this._handleSwipeEnd }
            ref={(node) => { this.listRef = node} }>
            { this.renderItems() }
          </ul>
        </div>
      </div>
    );
  }
}

Carousel.propTypes = {

};

export default Carousel;
