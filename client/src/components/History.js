import React from 'react'
import { FaHistory } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { IoIosArrowRoundForward } from "react-icons/io";
import { useHistory } from '../hooks/useHistory';

const History = () => {
  const historyModal = useHistory();
  return (
    <div className='overlay-root'>
        <div className='overlay'></div>
        <div className='history-body'>
            <div className='history-head-wrapper'>
                <div className='history-head'>
                    <h3>History</h3>
                    <IoMdClose size={21}/>
                </div>
                <div className='clear-history'>
                    <h3>Clear History</h3>
                </div>
                <div className='history-content'>
                    <div className='content-inner'>
                        <div className='content-head'>
                            <div className='content-head-lang'>
                                <span>From Language</span>
                                <span>→</span>
                                <span>To Language</span>
                            </div>
                            <IoMdClose />
                        </div>
                        <div className='languages'>
                          <p className='lang-from'>Lorem, ipsum dolor sit amet consectetur adipisicing elit</p>
                          <p className='lang-to'>Lorem, ipsum dolor sit amet consectetur adipisicing elit</p>
                        </div>
                        
                    </div>

                </div>
            </div>
            

        </div>

    </div>
  )
}

export default History