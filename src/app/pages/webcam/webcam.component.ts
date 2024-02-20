import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { createWorker, Worker } from 'tesseract.js';
import {AppService} from "../../app.service";

@Component({
  selector: 'app-webcam',
  templateUrl: './webcam.component.html',
  styleUrls: ['./webcam.component.css']
})
export class WebcamComponent implements AfterViewInit {
  @ViewChild('video') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;

  worker!: Worker;
  extractedText: string | undefined;
  extractedBackendText: any;
  capturing: boolean = false;
  captured: boolean = false;
  isLoading: boolean = false;
  error: string | undefined;
  dateNow: string = '';

  constructor(private appService: AppService) { }

  ngAfterViewInit() {
    this.initCamera();
    this.initializeWorker();
  }

  ngOnInit(){
    this.getDate();
  }

  getDate(){
    this.appService.getCurrentDateFromServer().subscribe(
      response => {
        this.dateNow = response.current_time;
      },
      error => {
        console.error('Error:', error);
      }
    );
  }
  initCamera() {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        this.videoElement.nativeElement.srcObject = stream;
        this.videoElement.nativeElement.play();
      })
      .catch(err => {
        this.error = 'Error accessing the webcam';});
  }

  async initializeWorker() {
    this.worker = await createWorker();
    await this.worker.load();
  }

  async capture() {
    const context = this.canvas.nativeElement.getContext('2d');
    if (context) {
      context.drawImage(this.videoElement.nativeElement, 0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
      console.log("image captured");
    }
    this.capturing = false;
    this.captured = true;
    this.videoElement.nativeElement.style.display = 'none';
  }

  async recognizeText() {
    this.isLoading = true;
    const imageData = this.canvas.nativeElement.toDataURL('image/png');
    const { data: { text } } = await this.worker.recognize(imageData);
    this.extractedText  = text;
    this.isLoading = false;
  }

  async extractUsingBackend() {
    this.isLoading = true;
    this.error = '';
    this.extractedText = undefined;
    const canvas = this.canvas.nativeElement;
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve));
    if (blob) {
      const formData = new FormData();
      formData.append('image', blob, 'image.jpg');

      console.log("sending to backend service");
      this.isLoading = true;
      this.appService.extractData(formData).subscribe(
        response => {
          this.extractedBackendText = response
          this.isLoading = false;
        },
        error => {
          this.isLoading = false;
          this.error = "An error occurred, please check back later";
          console.error('Error:', error);
        }
      );
    } else {
      this.error = "Error: Unable to convert canvas to Blob";
    }
  }

  async extractUsingWeb() {
    this.error = '';
    this.extractedBackendText = undefined;
    await this.recognizeText();
  }

  captureAgain() {
    this.captured = false;
    this.error = '';
    this.extractedText = '';
    this.extractedBackendText = '';
    this.videoElement.nativeElement.style.display = 'block';
    const context = this.canvas.nativeElement.getContext('2d');
    if (context) {
      context.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    }
  }
}
