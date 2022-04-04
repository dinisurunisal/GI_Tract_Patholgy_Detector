import { HttpClient, HttpEventType } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-predictor',
  templateUrl: './predictor.component.html',
  styleUrls: ['./predictor.component.scss']
})
export class PredictorComponent implements OnInit {

  @Input() requiredFileType:string;

  fileName = '';
  uploadProgress :number;
  uploadSub: Subscription;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
  }

  onFileSelected(event) {
    const file:File = event.target.files[0];
    console.log ('Name: ' + file.name + "\n" +
        'Type: ' + file.type + "\n" +
        'Size: ' + Math.round(file.size / 1024) + " KB");

    if (file) {
        this.fileName = file.name;
        const formData = new FormData();
        formData.append("images", file);

        const upload$ = this.http.post("/upload", formData, {
            reportProgress: true,
            observe: 'events'
        })
        .pipe(
            finalize(() => this.reset())
        );

        this.uploadSub = upload$.subscribe(event => {
          if (event.type == HttpEventType.UploadProgress) {
            this.uploadProgress = Math.round(100 * (event.loaded / event.total));
          }
        })
    }
  }

  cancelUpload() {
    this.uploadSub.unsubscribe();
    this.reset();
  }

  reset() {
    this.uploadProgress = null;
    this.uploadSub = null;
  }

}

