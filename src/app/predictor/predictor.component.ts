import { HttpClient, HttpEventType, HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Observable} from 'rxjs';
import { FileUploadService } from '../services/file-upload.service';

@Component({
  selector: 'app-predictor',
  templateUrl: './predictor.component.html',
  styleUrls: ['./predictor.component.scss']
})
export class PredictorComponent implements OnInit {

  imageSrc: string;
  selectedImages: FileList;
  uploadedImages = Array<string>();
  uploadProgress = [];
  message = '';
  fileDetails: Observable<any>;

  constructor(
    private http: HttpClient,
    private uploadService: FileUploadService
  ) { }

  ngOnInit(): void {
  }

  onFileSelect(event): void {
    this.uploadProgress = [];
    this.selectedImages = event.target.files;
    this.uploadedImages = [];
  }

  uploadFiles() {
    this.message = '';
    for (let i = 0; i < this.selectedImages.length; i++) {
      this.upload(i, this.selectedImages[i]);

      const reader = new FileReader();
      reader.readAsDataURL(this.selectedImages[i]);

      reader.onload = () => {
        this.uploadedImages.push(reader.result as string)
      }
    }
  }

  upload(idx, file) {
    this.uploadProgress[idx] = { value: 0, fileName: file.name };

    console.log ('Name: ' + file.name + "\n" +
    'Type: ' + file.type + "\n" +
    'Size: ' + Math.round(file.size / 1024) + " KB");

    this.uploadService.upload(file).subscribe(
      event => {
        if (event.type === HttpEventType.UploadProgress) {
          this.uploadProgress[idx].value = Math.round(100 * event.loaded / event.total);
        } else if (event instanceof HttpResponse) {
          this.message = event.body.message;
          this.fileDetails = this.uploadService.getUploadedFiles();
        }
      },
      err => {
        this.uploadProgress[idx].value = 0;
        this.message = 'Could not upload the file:' + file.name;
      });
  }

  getImageDetails(id) {
    return this.selectedImages[id]
  }

}

