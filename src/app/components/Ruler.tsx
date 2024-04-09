import React from 'react';
import styles from './styles.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';


interface RulerProps {
    labels?: string[]; 
    now?: string
}

const Ruler: React.FC<RulerProps> = ({ labels, now }) => {
    const tickCount = labels?.length || 0; // Handle empty labels case
    const tickInterval = 600 / (tickCount - 1); // Distance between ticks

    return (
        <div className={styles.ruler}>
            {labels?.map((label, index) => (
                <div key={index} className={styles.ruler__box}>
                    {label == now ? <div className={styles.ruler__icon}>
                        <FontAwesomeIcon icon={faCaretDown} />
                    </div> : undefined}
                    <div className={styles.ruler__label} style={{ left: index * tickInterval + 'px' }}>
                        {label}
                    </div>
                </div>
            ))}
        </div>


    );
};
export default Ruler;