import { HttpClient, HttpEventType, HttpResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatHorizontalStepper } from '@angular/material/stepper';
import { Observable} from 'rxjs';
import { FileUploadService } from '../services/file-upload.service';

@Component({
  selector: 'app-predictor',
  templateUrl: './predictor.component.html',
  styleUrls: ['./predictor.component.scss']
})
export class PredictorComponent implements OnInit {

  @ViewChild('stepper') stepper: MatHorizontalStepper;

  imageSrc: string;
  selectedImages: FileList;
  enableUpload = false;
  uploadedImages = Array<any>();
  uploadProgress = [];
  fileUploadList = [];
  fileDetails: Observable<any>;

  constructor(
    private http: HttpClient,
    private uploadService: FileUploadService
  ) { }

  ngOnInit(): void {
  }

  onFileSelect(event): void {
    this.uploadProgress = [];
    this.uploadedImages = [];
    this.fileUploadList = [];
    this.selectedImages = null;
    this.selectedImages = event.target.files;
    this.enableUpload = true;
  }

  uploadFiles() {

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

      this.enableUpload = false;
    }
  }

  upload(idx, file) {
    this.uploadProgress[idx] = { value: 0, fileName: file.name };
    this.fileUploadList[idx] = { fileName: file.name, message: '', validity: false };

    console.log ('Name: ' + file.name + "\n" +
    'Type: ' + file.type + "\n" +
    'Size: ' + Math.round(file.size / 1024) + " KB");

    this.uploadService.upload(file).subscribe(
      event => {
        if (event.type === HttpEventType.UploadProgress) {
          this.uploadProgress[idx].value = Math.round(100 * event.loaded / event.total);
        } else if (event instanceof HttpResponse) {
          this.fileUploadList[idx].message = event.body.message;
          this.fileUploadList[idx].validity = event.body.valid;
          // this.fileDetails = this.uploadService.getUploadedFiles();
        }
      }
    );
  }

  onFirstStepDone() {
    if (this.fileUploadList.length !== 0){
      this.stepper.next();
    }
  }

  onPredictClick() {
    for (let i = 0; i < this.selectedImages.length; i++) {

      this.uploadService.predict(this.selectedImages[i]).subscribe(
        event => {
          if (event instanceof HttpResponse) {
            console.log(event.body.prediction)
          } else if (event instanceof HttpResponse) {
          }
        }
      );
    }
  }

}

