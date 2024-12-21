import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loader-component',
  standalone: true,
  imports: [NgIf],
  templateUrl: './loader-component.component.html',
  styleUrl: './loader-component.component.css'
})
export class LoaderComponentComponent {
  @Input() isLoading: boolean = false;
}
