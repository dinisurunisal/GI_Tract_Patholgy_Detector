import { HttpClient, HttpEventType, HttpResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatHorizontalStepper } from '@angular/material/stepper';
import { Observable} from 'rxjs';
import { FileUploadService } from '../services/file-upload.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import findingJson from '../../assets/json/findings-details.json';

interface Predictions {
  imageName: String;
  class1: String;
  class2: String;
  class3: String;
  class1Type: String;
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
  @ViewChild('pdfReport') pdfReport!: ElementRef;

  imageSrc: string;
  selectedImages: FileList;
  enableUpload = false;
  uploadedImages = Array<any>();
  uploadProgress = [];
  fileUploadList = [];
  fileDetails: Observable<any>;
  dataDisplay = new Array<Predictions>();
  showSpinner = true;
  currentDate = new Date();

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
    if (this.fileUploadList.length !== 0 && !this.enableUpload){
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
    this.dataDisplay = [];

    for (let i = 0; i < this.selectedImages.length; i++) {

      this.uploadService.predict(this.selectedImages[i]).subscribe(
        response => {
          if (response instanceof HttpResponse) {
            this.dataDisplay.push({
              imageName: response.body.prediction.imageName,
              class1: findingJson.category.find(x => x.code === response.body.prediction.class1)?.name || response.body.prediction.class1,
              class2: findingJson.category.find(x => x.code === response.body.prediction.class2)?.name || response.body.prediction.class2,
              class3: findingJson.category.find(x => x.code === response.body.prediction.class3)?.name || response.body.prediction.class3,
              class1Type: findingJson.category.find(x => x.code === response.body.prediction.class1)?.type || "Cannot Be Detected",
              prob1: response.body.prediction.prob1,
              prob2: response.body.prediction.prob2,
              prob3: response.body.prediction.prob3,
            });
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

  public openPDF(): void {
    let DATA: any = document.getElementById('pdfReport');

    html2canvas(DATA).then((canvas) => {

      var HTML_Width = canvas.width;
      var HTML_Height = canvas.height;
      var top_left_margin = 15;
      var PDF_Width = HTML_Width+(top_left_margin*2);
      var PDF_Height = (PDF_Width*1.5)+(top_left_margin*2);
      var canvas_image_width = HTML_Width;
      var canvas_image_height = HTML_Height;

      var totalPDFPages = Math.ceil(HTML_Height/PDF_Height)-1;

      canvas.getContext('2d');
			console.log(canvas.height+"  "+canvas.width);

			const FILEURI = canvas.toDataURL('image/png', 1.0);
      let PDF = new jsPDF('p', 'pt',  [PDF_Width, PDF_Height]);
      PDF.addImage(FILEURI, 'PNG', top_left_margin, top_left_margin,canvas_image_width,canvas_image_height);

			for (let i = 1; i <= totalPDFPages; i++) {
				PDF.addPage([PDF_Width, PDF_Height]);
				PDF.addImage(FILEURI, 'PNG', top_left_margin, -(PDF_Height*i)+(top_left_margin*4),canvas_image_width,canvas_image_height);
			}
      PDF.save('Gastro-Report.pdf');
    });
  }

}

