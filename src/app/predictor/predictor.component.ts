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
  uploadedImages = Array<any>();
  uploadProgress = [];
  message = '';
  fileDetails: Observable<any>;
  imageisloaded = false;

  constructor(
    private http: HttpClient,
    private uploadService: FileUploadService
  ) { }

  ngOnInit(): void {
  }

  onFileSelect(event): void {
    this.uploadProgress = [];
    this.selectedImages = null;
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
        const dataToBeSubmitted = {
          name: this.selectedImages[i].name,
          type: this.selectedImages[i].type,
          size: Math.round(this.selectedImages[i].size / 1024) + " KB",
          src: reader.result as string
        }
        this.uploadedImages.push(dataToBeSubmitted)
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

    this.imageisloaded = true;
  }

  onPredictClick() {

  }

}

