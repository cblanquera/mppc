import { Component, OnInit } from '@angular/core'; 
import { LoadingController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { ChainModel } from '../models/chain.model';
import { ConnectwalletService } from '../utils/connectwallet.service';
import { ToastMessageService } from '../utils/toast-message.service';
import * as authorized from './authorized.json';
@Component({
  selector: 'app-mint',
  templateUrl: './mint.page.html',
  styleUrls: ['./mint.page.scss'],
})
export class MintPage implements OnInit {  
  numMint=1;
  receiptDisplay='';
  myUserAddress = null;
  isChainLoaded = false;
  chainModel:ChainModel = {}; 
  config = environment.configchain;
  env= environment;
  ethereum= (<any>window).ethereum; 
  
  navs=[
    {
      name:"Twitter",
      link:"https://twitter.com/MPPCnft"
    }
  ]


  constructor(
    private connectWallet:ConnectwalletService,
    private loadingController:LoadingController,
    private toast:ToastMessageService) { 
      
      var _this = this;  
      if(this.ethereum){
        this.ethereum.on("accountsChanged", async (accounts) => {  
          _this.myUserAddress = null;
          await _this.onConnectWallet();  
        });
        this.ethereum.on("chainChanged", async () => { 
          _this.myUserAddress = null;
          await _this.onConnectWallet();   
        });
        this.ethereum.on("close", (error) => { 
            console.log("Errorethereum",error);
        });
      }
  }

  ngOnInit() {  
    if(!environment.production){
      this.onConnectWallet();
    }
  }

  async onConnectWallet(){
    if(!this.myUserAddress){ 
      await this.connectWallet.connect();
      await this.onRefreshChainData();
    }
  }

  async onRefreshChainData(){
    return new Promise<any>(async resolve=>{ 
      const loading = await this.loadingController.create({ message: "Please wait ...."  });
      await loading.present(); 
      this.isChainLoaded = false; 

      this.myUserAddress = this.connectWallet.userAddress; 
      this.chainModel.treasury =  await this.connectWallet.contract.methods.treasury().call(); 
      this.chainModel.MAX_SUPPLY =  parseInt(await this.connectWallet.contract.methods.MAX_SUPPLY().call());
      this.chainModel.mintPrice =  parseInt(await this.connectWallet.contract.methods.mintPrice().call());
      this.chainModel.maxPerWallet =  parseInt(await this.connectWallet.contract.methods.maxPerWallet().call());
      this.chainModel.totalSupply =  parseInt(await this.connectWallet.contract.methods.totalSupply().call()); 
      this.chainModel.minted =  parseInt(await this.connectWallet.contract.methods.minted(this.myUserAddress).call());
      this.chainModel.saleStarted =  await this.connectWallet.contract.methods.saleStarted().call(); 

      console.log(this.chainModel ); 

      this.isChainLoaded = true; 

      await loading.dismiss();
      this.onNumMint(1);
      this.onReceipt();
      resolve({});
    });
  } 


  async onMint(){
    let gasLimit = this.config.GAS_LIMIT; 
    if(!this.myUserAddress){
      this.toast.presentToast("Wallet is not yet connected");
      return;
    }
    if(!this.env.isStartedMint){
      this.toast.presentToast("Soon...");
      return;
    }
 
    if(this.numMint <= 0){
      this.toast.presentToast("Number of mint must greater than zero.");
      return;
    }

    if(this.chainModel.MAX_SUPPLY == this.chainModel.totalSupply){
      this.toast.presentToast("Sold out");
      return;
    }
    if(this.chainModel.MAX_SUPPLY < this.numMint){
      this.toast.presentToast("Exceed to remaining balance.");
      return;
    } 
    
    let quantity = this.numMint;
    let value  = quantity * this.chainModel.mintPrice;   
    let totalGasLimit = String(gasLimit * quantity);  

    if((quantity + this.chainModel.minted) > this.chainModel.maxPerWallet){ 
      this.toast.presentToast(`Exceed to Max Mint.`);
      return;
    }
    if((quantity * this.chainModel.mintPrice) > value){
      this.toast.presentToast("Not enough value");
      return;
    }  

    if(!this.chainModel.saleStarted){
      // Whitelist Minting
      const proof = this.getProof(this.myUserAddress);   
      if(!proof){
        this.toast.presentToast("Not listed");
        return;
      }  
      
      await this.connectWallet.contract.methods.mint(quantity, this.chainModel.maxPerWallet, proof).send({ 
        gasLimit: totalGasLimit,
        to: this.config.CONTRACT_ADDRESS,
        from: this.myUserAddress ,
        value: value 
      });  
    }else{  
      // Public Minting
      await this.connectWallet.contract.methods.mint(quantity).send({ 
        gasLimit: totalGasLimit,
        to: this.config.CONTRACT_ADDRESS,
        from: this.myUserAddress ,
        value: value 
      });  
    }  

    this.numMint = 0 ;
    this.onReceipt();
  }
 

  onReceipt(){     
    this.receiptDisplay = ''; 
    this.receiptDisplay += `Max Mint Per Wallet : ${this.chainModel.maxPerWallet} <br>`;
    this.receiptDisplay += `${this.numMint} MPPC${(this.numMint>1?'s':'')} cost for ${(this.chainModel.mintPrice/Math.pow(10,18)*this.numMint).toFixed(2)} ETH`;
  } 

  onNumMint(val){
    this.numMint = val;
    this.onReceipt();
  }

  onOpenWindow(url){
    window.open(url,"_blank");
  }

  onMouseOutClick(e,src){
    console.log("onMouseOutClick",e.target.src);
    e.target.src = src;
  }

  onMouseOverClick(e,src){
    console.log("onMouseOverClick",e.target);
    e.target.src = src;
  }
  
  getProof(address){
    return JSON.parse(JSON.stringify(authorized))[address];
  }
 
}
