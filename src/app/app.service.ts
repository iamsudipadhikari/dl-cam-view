import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  public constructor(private http:HttpClient) {
  }

  extractData(formData:any){
    return this.http.post("http://localhost:5000/process-image", formData);
  }
}
