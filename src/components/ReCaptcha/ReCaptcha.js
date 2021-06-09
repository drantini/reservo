import { auth, firebaseBuffer } from '../../helpers/firebase'
import { useEffect } from 'react';

function ReCaptcha(props){
    useEffect(() => {
        window.recaptchaVerifier = new firebaseBuffer.auth.RecaptchaVerifier(
            "captcha-container", {
                'size': 'small',
                'callback': (response) => {
                    props.setAllowSubmit(true);
                },
                'expired-callback': () => {
                    props.setAllowSubmit(false);
                }
            }
        );
        window.recaptchaVerifier.render()

    }, [props.activator])

    return(
        <div id="captcha-container" className="captcha-container"></div>
    )
}
export default ReCaptcha;