import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Country } from '../common/country';
import { State } from '../common/state';

@Injectable({
  providedIn: 'root'
})
export class AppFormService {

  private countriesUrl: string= "http://localhost:7070/api/countries";
  private statesUrl: string= "http://localhost:7070/api/states";

  constructor(private httpClient: HttpClient) { }

  getCreditCardMonths(startMonth: number): Observable<number[]>{
    let data: number[]= [];

    for(let theMonth=startMonth; theMonth<=12; theMonth++){
      data.push(theMonth);
    }

    return of(data);
  }

  getCreditCardYears(): Observable<number[]>{
    let data: number[]= [];

    const startYear: number= new Date().getFullYear();

    for(let theYear=startYear; theYear<=startYear+10; theYear++){
      data.push(theYear);
    }

    return of(data);
  }

  getCountries(): Observable<Country[]>{
    return this.httpClient.get<GetResponseCountries>(this.countriesUrl).pipe(map(
      response => response._embedded.countries
    ));
  }

  getStates(theCountryCode: string): Observable<State[]>{

    const searchUrl= `http://localhost:7070/api/states/search/findByCountryCode?code=${theCountryCode}`;

    return this.httpClient.get<GetResponseStates>(searchUrl).pipe(map(
      response => response._embedded.states
    ));
  }

  }
  
  interface GetResponseCountries{
    _embedded:{
      countries: Country[];
    }
  }

  interface GetResponseStates{
    _embedded:{
      states: State[];
    }
  }