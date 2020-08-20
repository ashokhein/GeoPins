import React, { Component } from 'react';
import { ReCaptcha } from 'react-recaptcha-v3'

class Captcha extends Component {

  verifyCallback = (recaptchaToken) => {
    // Here you will get the final recaptchaToken!!!  
    console.log(recaptchaToken, "<= your recaptcha token")
  }

  updateToken = () => {
    // you will get a new token in verifyCallback
    this.recaptcha.execute();
  }
  render() {
    return (
      <div>

        <ReCaptcha
            ref={ref => this.recaptcha = ref}
            sitekey="6Ld7orIZAAAAAFTU04viCXni-GIHFFYDatb7z2Ol"
            action='submit'
            verifyCallback={this.verifyCallback}
        />
      </div>
    );
  };
};

export default Captcha;