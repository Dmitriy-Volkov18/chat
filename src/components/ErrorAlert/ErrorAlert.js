import React from 'react'
import {connect} from "react-redux"
import "./ErrorAlert.styles.css"

const ErrorAlert = ({errors}) => errors !== null && errors.length > 0 
    && errors.map((error, index) => (
        <div key={index} className="errorAlert-block">
            <p className={`errorAlert-${error.alertType}`}>{error.msg}</p>
        </div>
    )
)

const mapStateToProps = (state) => ({
    errors: state.errors
})

export default connect(mapStateToProps)(ErrorAlert)
