import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BoardSchemeJson } from '../dashboard/board/BoardSchemeJson';

@Injectable({
  providedIn: 'root'
})
export class ProcessExerciseService {
  private baseUrl = 'http://localhost:8787';

  constructor(private http: HttpClient) { }

  compute(scheme: BoardSchemeJson): Observable<any> {
    const url = `${this.baseUrl}/compute`;
    
    return this.http.post(url, { scheme: scheme });
  }
}
