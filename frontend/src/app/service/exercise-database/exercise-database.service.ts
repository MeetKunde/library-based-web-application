import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExerciseDatabaseService {
  private baseUrl = 'http://localhost:3232';

  constructor(private http: HttpClient) {}

  readExercise(filePath: string): Observable<string> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    return this.http.get<string>(`${this.baseUrl}/api/get-exercise?path=${filePath}`, httpOptions);
  }

  writeExercise(filePath: string, data: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    return this.http.post(`${this.baseUrl}/api/save-exercise`, { path: filePath, content: data }, httpOptions);
  }
}
