import { TuiRoot } from "@taiga-ui/core";
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from "./components/navbar/navbar";
import { NgModule } from '@angular/core';

import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from "@angular/common";
import { NgIf } from "@angular/common";
import { NgFor } from "@angular/common";


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TuiRoot, Navbar, HttpClientModule, CommonModule, NgIf, NgFor,
  ],
  templateUrl: './app.html',
  styleUrl: './app.less',
})
export class App {
  protected title = 'mol-response';
}
