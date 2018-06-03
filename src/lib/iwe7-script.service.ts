import { Injectable, Inject } from "@angular/core";
import { DOCUMENT } from "@angular/common";

import { Subject, forkJoin, from, Observable } from "rxjs";
import { tap } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class Iwe7ScriptService {
  private loaded = false;
  private list: Map<string, boolean> = new Map();

  constructor(@Inject(DOCUMENT) public doc: any) { }

  load(path: string[]): Observable<any> {
    // 加载jquery
    // 加载bootstrap
    // 加载插件
    const obs: Observable<any>[] = [];
    path.map(res => {
      if (res.indexOf(".css") > -1) {
        obs.push(this.loadCss(res));
      } else {
        obs.push(this.loadScript(res));
      }
    });
    return forkJoin(...obs);
  }

  private loadScript(path: string): Observable<any> {
    return Observable.create(observer => {
      if (this.list.get(path) === true) {
        observer.next(<any>{
          path: path,
          loaded: true,
          status: "Loaded"
        });
        observer.complete();
      } else {
        const node = this.doc.createElement("script");
        node.type = "text/javascript";
        node.src = path;
        node.charset = "utf-8";
        if ((<any>node).readyState) {
          (<any>node).onreadystatechange = () => {
            if (
              (<any>node).readyState === "loaded" ||
              (<any>node).readyState === "complete"
            ) {
              (<any>node).onreadystatechange = null;
              observer.next(<any>{
                path: path,
                loaded: true,
                status: "Loaded"
              });
              observer.complete();
              this.list.set(path, true);
            }
          };
        } else {
          node.onload = () => {
            observer.next(<any>{
              path: path,
              loaded: true,
              status: "Loaded"
            });
            observer.complete();
            this.list.set(path, true);
          };
        }
        node.onerror = (error: any) =>
          observer.error(<any>{
            path: path,
            loaded: false,
            status: "Loaded"
          });
        document.getElementsByTagName("head")[0].appendChild(node);
      }
    });
  }

  private loadCss(path: string): Observable<any> {
    return Observable.create(observer => {
      if (this.list.get(path) === true) {
        observer.next(<any>{
          path: path,
          loaded: true,
          status: "Loaded"
        });
        observer.complete();
      } else {
        const node = document.createElement("link");
        node.rel = "stylesheet";
        node.type = "text/css";
        node.href = path;
        document.getElementsByTagName("head")[0].appendChild(node);
        observer.next(<any>{
          path: path,
          loaded: true,
          status: "Loaded"
        });
        observer.complete();
        this.list.set(path, true);
      }
    });
  }
}
