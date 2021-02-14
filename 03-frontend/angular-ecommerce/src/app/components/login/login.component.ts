import { Component, OnInit } from '@angular/core';
import { OktaAuthService } from '@okta/okta-angular';
import myAppConfig from '../../config/my-app-config'
import * as OktaSignin from '@okta/okta-signin-widget'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  oktaSignin: any;

  constructor(private oktaAuthService: OktaAuthService) { 

    // initialize Okta Sigin Widget
    this.oktaSignin= new OktaSignin({
      logo:'assets/images/logo.png',
      features:{
        registration: true
      },
      baseUrl: myAppConfig.oidc.issuer.split('/oauth2')[0], //everything before oauth2
      clientId: myAppConfig.oidc.clientId,
      redirectUri: myAppConfig.oidc.redirectUri,
      authParams:{
        pkce:true,
        issuer: myAppConfig.oidc.issuer,
        scope: myAppConfig.oidc.scopes
      }

    })
  }

  ngOnInit(): void {
    this.oktaSignin.remove();// remove previous data

    this.oktaSignin.renderEl({
      el:'#okta-signin-widget'},
      (response)=>{
        if(response.status=='SUCCESS'){
          this.oktaAuthService.signInWithRedirect();
        }
      },
      (error)=>{
        throw error;
      }
      )
  }

}
