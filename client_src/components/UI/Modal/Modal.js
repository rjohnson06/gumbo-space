import React, { Component } from 'react';

import classes from './Modal.module.css';
import Aux from '../../../hoc/Auxilliary';
import Backdrop from '../Backdrop/Backdrop';

class Modal extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.show !== this.props.show || nextProps.children !== this.props.children;
  }

  render() {
    return (
      <Aux>
        <Backdrop show={this.props.show} clicked={this.props.modalClosed} />
        <div
          style={{
            transform: this.props.show ? '' : 'translateY(-100vh)',
            opacity: this.props.show ? '1' : '0'
          }} className={classes.Modal + " " + this.props.classes}>
          {this.props.children}
        </div>
      </Aux>
    );
  }
}

export default Modal;
