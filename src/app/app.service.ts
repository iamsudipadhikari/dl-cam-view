import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  url = "https://sudipadhikari-dl-extraction.hf.space";
  public constructor(private http:HttpClient) {
  }

  extractData(formData:any){
    return this.http.post(`${this.url}/process-image`, formData);
  }

  getCurrentDateFromServer(): Observable<{ current_time: string }> {
    return this.http.get<{ current_time: string }>(`${this.url}/now`);
  }
}
