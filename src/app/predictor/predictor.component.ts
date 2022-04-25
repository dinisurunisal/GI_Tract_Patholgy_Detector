import { HttpClient, HttpEventType, HttpResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatHorizontalStepper } from '@angular/material/stepper';
import { Observable} from 'rxjs';
import { FileUploadService } from '../services/file-upload.service';

interface Predictions {
  imageName: String;
  class1: String;
  class2: String;
  class3: String;
  prob1: String;
  prob2: String;
  prob3: String;
}

@Component({
  selector: 'app-predictor',
  templateUrl: './predictor.component.html',
  styleUrls: ['./predictor.component.scss']
})
export class PredictorComponent implements OnInit {

  @ViewChild('stepper') stepper: MatHorizontalStepper;
  @ViewChild('takeInput', {static: false}) takeInput: ElementRef;

  imageSrc: string;
  selectedImages: FileList;
  enableUpload = false;
  uploadedImages = Array<any>();
  uploadProgress = [];
  fileUploadList = [];
  fileDetails: Observable<any>;
  dataDisplay = new Array<Predictions>();
  showSpinner = true;

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
    this.dataDisplay = [];
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
      response => {
        if (response.type === HttpEventType.UploadProgress) {
          this.uploadProgress[idx].value = Math.round(100 * response.loaded / response.total);
        } else if (response instanceof HttpResponse) {
          this.fileUploadList[idx].message = response.body.message;
          this.fileUploadList[idx].validity = response.body.valid;
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

  onResetClick() {
    this.uploadProgress = [];
    this.uploadedImages = [];
    this.fileUploadList = [];
    this.dataDisplay = [];
    this.selectedImages = null;
    this.takeInput.nativeElement.value = "";
    this.stepper.reset();
    this.stepper.selectedIndex = 0;
  }

  onPredictClick() {
    for (let i = 0; i < this.selectedImages.length; i++) {

      this.uploadService.predict(this.selectedImages[i]).subscribe(
        response => {
          if (response instanceof HttpResponse) {
            this.dataDisplay.push(response.body.prediction);
            console.log(response.body.prediction)
            this.showSpinner = false;
          }
        }
      );
    }
  }

  getFileImage(name) {
    return this.uploadedImages.find(x => x.name === name)?.src;
  }

}

