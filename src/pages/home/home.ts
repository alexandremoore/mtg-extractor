import { MtgCard } from './../../model/Card';
import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NavController, ToastController } from 'ionic-angular';
import { SetsProvider } from '../../providers/sets/sets';
import { MtgSet } from './../../model/Set';
import { MtgSimpleSet } from './../../model/SimpleSet';
import { NgProgress } from 'ngx-progressbar';
import { MatTableDataSource, MatSort } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import "rxjs/add/operator/map";
import 'rxjs/add/observable/of';

declare global {
  interface Window {
    require: any;
  }
}
const path = window.require('path');
const request = window.require('request');
const remote = window.require('electron').remote;
var fs = remote.require('fs');
const app = remote.app;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  simpleSets: Array<MtgSimpleSet> = [];
  selectedSet: MtgSet;
  selectedSets: Array<string> = [];
  selectedCards: Array<MtgCard> = [];

  displayedColumns = ['id', 'name', 'text', 'set'];
  dataSource: any;

  @ViewChild(MatSort) sort: MatSort;

  constructor(public navCtrl: NavController, private setsProvider: SetsProvider, private progress: NgProgress, private toastCtrl: ToastController, private changeDetector: ChangeDetectorRef) {

    this.setsProvider.getSimpleSetList().subscribe(result => {
      this.simpleSets = result;
      this.simpleSets.sort((a: any, b: any) => {
        return (
          new Date(b.releaseDate).getTime() -
          new Date(a.releaseDate).getTime()
        );
      });
    });

  }

  updateSelectedSets(code: string, event: any): void {
    console.log(event.checked);
    if (event.checked === true) {
      this.addToSelectedSets(code);
    } else {
      this.removeFromSelectedSets(code);
    }
    console.log(this.selectedSets);
  }

  setSelected(simpleSet: MtgSimpleSet): void {
    this.setsProvider.getSet(simpleSet.code).subscribe(result => {
      this.selectedSet = result;
      this.selectedSet.cards.forEach((card, index, cards) => {
        cards[index] = Object.assign({
          imageUrl: `http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=${card.multiverseid}&type=card`,
          setCode: simpleSet.code
        }, card);
      });
      this.dataSource = new MatTableDataSource(this.selectedSet.cards);
      this.dataSource.sort = this.sort;
     
    });
  }
  downloadSelectedSetsCardsInfo(): void {
    this.dataSource = null;
    this.selectedCards = [];
    this.progress.start();

    this._downloadSelectedSetsCardsInfo().subscribe(result => {
      this.selectedCards = result;
      this.dataSource = new MatTableDataSource(this.selectedCards);
      this.dataSource.sort = this.sort;
      this.changeDetector.detectChanges();
      this.progress.done();
    });
  }
  private _downloadSelectedSetsCardsInfo(): Observable<any> {
    if (this.selectedSets.length === 0) {
      return Observable.of([]);
    }
    
    let observables: Array<Observable<any>> = [];
    this.selectedSets.forEach(set => {
      observables.push( this.setsProvider.getSet(set).map((res => res)));
    });
    return Observable.forkJoin(observables)
    .map((data: any[]) => {
      let allCards: Array<MtgCard> = [];
      data.forEach(result => {
        this.selectedSet = result;
        this.selectedSet.cards.forEach((card, index, cards) => {
          cards[index] = Object.assign({
            imageUrl: `http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=${card.multiverseid}&type=card`,
            setCode: result.code
          }, card);
        });
        allCards.push(...this.selectedSet.cards);
      })
      return allCards;
    });
    
    // this.selectedSets.forEach(set => {
    //   this.setsProvider.getSet(set).subscribe(result => {
    //     this.selectedSet = result;
    //     this.selectedSet.cards.forEach((card, index, cards) => {
    //       cards[index] = Object.assign({
    //         imageUrl: `http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=${card.multiverseid}&type=card`,
    //         setCode: set
    //       }, card);
    //     });
    //     this.selectedCards.push(...this.selectedSet.cards);
    //     this.dataSource = new MatTableDataSource(this.selectedCards);
    //     this.dataSource.sort = this.sort;
    //     this.changeDetector.detectChanges();
    //   });
    // });
  }

  downloadAllCards(): void {
    if (this.selectedCards) {
      this.progress.start();
      let downloadedCards = 0;
      this.selectedCards.forEach(card => {
        let file = path.join(app.getPath('downloads'), 'mtg-extractor', `${card.setCode}`, `${card.imageName}.full.jpg`);
        this.createDiretory(file);
        this.downloadFile(card.imageUrl, file).then(result => {
          downloadedCards = ++downloadedCards;
          if (this.selectedCards.length === downloadedCards) {
            this.progress.done();
            this.showToast('Download complete.')
          }
        });
      });
    }
  }

  isElectron(): boolean {
    return navigator.userAgent.toLowerCase().indexOf(' electron/') > -1;
  }

  createDiretory(filePath): boolean {
    var dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
      return true;
    }
    this.createDiretory(dirname);
    fs.mkdirSync(dirname);
  }

  downloadFile(file_url, targetPath) {

    var req = request({
      method: 'GET',
      uri: file_url
    });

    var out = fs.createWriteStream(targetPath);
    req.pipe(out);

    // return a promise and resolve when download finishes
    return new Promise((resolve, reject) => {
      req.on("end", () => {
        resolve();
      });

      req.on("error", () => {
        reject();
      });
    });
  }

  showToast(message: string, position = 'middle') {
    const toast = this.toastCtrl.create({
      message: message,
      position: position,
      duration: 5000,
      showCloseButton: true,
      closeButtonText: 'Ok'
    });

    toast.present();
  }

  public showDownload(): boolean {
    return this.selectedSet ? this.isElectron() : false;
  }

  private addToSelectedSets(code: string) {
    const index = this.selectedSets.indexOf(code);
    if (index === -1) {
      this.selectedSets.push(code);
    }
    
  }

  private removeFromSelectedSets(code: string) {
    const index = this.selectedSets.indexOf(code);
    if (index > -1) {
      this.selectedSets.splice(index, 1);
    } 
  }
}
