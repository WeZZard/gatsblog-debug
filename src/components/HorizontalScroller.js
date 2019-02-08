import React from 'react'
import styles from './HorizontalScroller.module.scss'

class HorizontalScroller extends React.Component {
    render() {
        const props = this.props;

        return <section className={[styles.horizontalScroller, 'geometryBlockTop', 'geometryBlockBottom'].join(' ')} {...props}/>
    }
}

export default HorizontalScroller