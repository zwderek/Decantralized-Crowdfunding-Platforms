import { Button, Form, Input, Modal, message } from 'antd';
import React, { useState } from 'react';
import styles from "./index.module.css";
import { useParams } from 'react-router-dom';

import { Campaign } from "../../abi/abi";
import { CampaignFactory } from "../../abi/abi";
import Web3 from "web3";

const web3 = new Web3(Web3.givenProvider);


export default function SearchList(props) {
  const [list] = useState(JSON.parse(localStorage.getItem("campaigns")));

  const { id } = useParams();
  const campaignContract = new web3.eth.Contract(Campaign, id);
  console.log('id: ', id);

  const [update, setUpdate] = useState(false);
  const [showCreate, setShowCreate] = useState(false);


  var [_detail, _setDetail] = useState({
    raiser: "",
    balance: "",
    target: "",
    campaign_board: "",
    campaign_description: "",
    contributers_count: "",
    numRequests: "",
    start_timestamp: "",
    end_timestamp: "",
    is_end: "",
    requests_list: [],
    contributors_detail: [],
    contributors_detail_string: ""
  });
  //_detail.description = "Campaign";

  const _detailGet = async (t) => {
    t.preventDefault();

    var ret = {};
    
    const campaignSummery = await campaignContract.methods.getSummery().call();
    const campaignDetails = await campaignContract.methods.getDetails().call();

    ret.raiser = campaignSummery[0];
    ret.balance = await web3.eth.getBalance(id);
    ret.target = campaignSummery[5];
    ret.campaign_description = campaignSummery[1];
    ret.campaign_board = campaignSummery[2];
    ret.contributers_count = campaignSummery[3];
    ret.numRequests = campaignSummery[4];
    ret.start_timestamp = campaignDetails[0];
    ret.end_timestamp = campaignDetails[1];
    ret.is_end = campaignDetails[2];
    ret.current_timestamp = (await web3.eth.getBlock("latest")).timestamp;

    ret.requests_list = [];
    ret.contributors_detail = [];
    ret.contributors_detail_string = "";

    var contributors_list = await campaignContract.methods.getContributers().call();

    for (let i = 0; i < contributors_list.length; i++) {
      var con = {};
      con.address = contributors_list[i];
      con.amount = await campaignContract.methods.getContributerAmount(contributors_list[i]).call();
      ret.contributors_detail.push(con);
      ret.contributors_detail_string += "No." + (i+1).toString() + " Address: " + con.address + " Current Amount:" + con.amount + "\n";
    }
    for (let i = 0; i < ret.numRequests; i++) {
      var requestSummery = await campaignContract.methods.getRequestSummery(i).call();
      var requestDetails = await campaignContract.methods.getRequestDetails(i).call();
      var r = {};
      r.id = i;
      r.request_description = requestSummery[0];
      r.value = requestSummery[1];
      r.start_timestamp = requestSummery[2];
      r.end_timestamp = requestSummery[3];
      r.is_completed = requestDetails[0];
      r.approvalCount = requestDetails[1];
      r.approvalPercentage = requestDetails[2];
      ret.requests_list.push(r);
    }
    console.log("ret", ret);
    _setDetail(ret);
  }

  //const [detail, setDetail] = useState(list.find(item => item.id === id));

  const onFinish_ = async (values) => { //update info by raiser
    const accounts = await window.ethereum.enable();
    const account = accounts[0];
    console.log('Success:', values);
    //const gas = await campaignContract.methods.createRequest(values.description, parseInt(values.amount)).estimateGas();
    const post = await campaignContract.methods.customize(values.info).send({
      from: account,
      //gasPrice: 2510000000,
    });
    setShowCreate(false);
  }

  const onFinishFailed_ = async () => {

  }


  const onFinish = async (values) => { //create request by raiser
    // create a request
    const accounts = await window.ethereum.enable();
    const account = accounts[0];
    console.log('Success:', values);
    console.log('contract address:', id);
    console.log('account address:', accounts[0]);
    //const gas = await campaignContract.methods.createRequest(values.description, parseInt(values.amount)).estimateGas();
    const post = await campaignContract.methods.createRequest(values.description, parseInt(values.amount)).send({
      from: account,
      //gasPrice: 2510000000,
    });
    setShowCreate(false);
    /*
    detail.requests.push({
      id: new Date().getTime() + "_" + Math.random() * 1000,
      ...values,
    });

    setDetail({ ...detail });
    localStorage.setItem("campaigns", JSON.stringify(list))
    message.success("Submit Success");
    console.log("list", list)
    setShowCreate(false);*/
  }

  const onFinishFailed = async () => {

  }

  const refund = async () => {

    const accounts = await window.ethereum.enable();
    const account = accounts[0];
    const post = await campaignContract.methods.refund().send({
      from: account,
    });

  }

  const finalizeRequest = async (id) => {
    console.log('Finalize:', id);
    const accounts = await window.ethereum.enable();
    const account = accounts[0];
    const gas = await campaignContract.methods.finalizeRequest(id).estimateGas();
    const post = await campaignContract.methods.finalizeRequest(id).send({
      from: account,
      gas,
    });


  }

  const approveRequest = async (id) => {
    console.log('Approve:', id);
    const accounts = await window.ethereum.enable();
    const account = accounts[0];
    //const gas = await campaignContract.methods.approveRequest(id).estimateGas();
    const post = await campaignContract.methods.approveRequest(id).send({
      from: account,
      //gas,
    });

  }

  return (<>

    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#000", padding: 20 }}>
        <span style={{ fontSize: 16, fontWeight: "bold", color: "#fff" }}> Campaign Address: {id}</span>
        <Button type='primary' style={{}} onClick={_detailGet}>Refresh</Button>
    </div>

    <div className={styles.searchList} >

      <h3>{_detail.campaign_description}</h3>
      <div style={{ fontsize: 3, backgroundColor: "#eee", padding: 20, borderRadius: 10, maxHeight: 150, overflow: "auto" }}>
        Raiser: {_detail.raiser} <br />
        Balance/Target: {_detail.balance}/{_detail.target} <br />
        Board: {_detail.campaign_board} <br />
        Lifespan Details: is_end: {_detail.is_end.toString()} ,start-end: {_detail.start_timestamp}-{_detail.end_timestamp} ,current timestamp: {_detail.current_timestamp} <br />
        Requests Amount: {_detail.numRequests} <br />
        Contributors Amount: {_detail.contributers_count} <br />
        Contributors Details: <br /> {_detail.contributors_detail_string.split('\n').map(str => <p>{str}</p>)}
        

      </div>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        
        <Button type='primary' style={{ width: 160, marginTop: 20 }} onClick={() => {
          setUpdate(true);
        }}>Update Info</Button>

        <Button type='primary' style={{ width: 160, marginTop: 20 }} onClick={() => {
          setShowCreate(true);
        }}>Create Request</Button>

        <Button type='primary' style={{ width: 160, marginTop: 20 }} onClick={() => {
          refund();
        }}>Refund</Button>
      </div>

       
      <div className={styles.listItems}>
        {
          _detail.requests_list.map((item, index) => {
            return <div key={item.id} className={styles.listItem}>
              <div style={{ padding: 10, boxSizing: "border-box" }} >
                <div>Request {index}</div>
                <div style={{ color: "#888", marginTop: 0, fontsize: 3 }}>Description: {item.request_description}</div>
                <div style={{ color: "#888", marginTop: 0, fontsize: 3 }}>Value: {item.value} / is_completed: {item.is_completed.toString()}</div>
                <div style={{ color: "#888", marginTop: 0, fontsize: 3 }}>start-end: {item.start_timestamp}-{item.end_timestamp}</div>
                <div style={{ color: "#888", marginTop: 0, fontsize: 3 }}>Approvement Status: {item.approvalPercentage}%</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span>{item.lifespan}</span>
                <Button onClick={() => {finalizeRequest(item.id)}}>Finalize by Raiser</Button>
                <Button type='primary' onClick={() => {approveRequest(item.id)}}>Approve by Contributors</Button>
              </div>
            </div>
          })
        }
      </div>

      <Modal title="Create Request" footer={null} onCancel={() => {
        setShowCreate(false);
      }} open={showCreate}>
        <Form
          name="basic"
          layout="vertical"
          style={{ maxWidth: 600 }}
          initialValues={{ remember: true }}
          onFinish={onFinish}

          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please input description!' }]}
          >
            <Input.TextArea style={{ height: 100 }} />
          </Form.Item>

          <Form.Item
            label="Amount"
            name="amount"
            rules={[{ required: true, message: 'Please input  amount!' }]}
          >
            <Input type='number' />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
              Create
            </Button>
          </Form.Item>
        </Form>
      </Modal>


      <Modal title="Update Info" footer={null} onCancel={() => {
        setUpdate(false);
      }} open={update}>
        <Form
          name="basic"
          layout="vertical"
          style={{ maxWidth: 600 }}
          initialValues={{ remember: true }}
          onFinish={onFinish_}

          onFinishFailed={onFinishFailed_}
          autoComplete="off"
        >
          <Form.Item
            label="Raiser can update Campaign Progress in Campaign Board"
            name="info"
            rules={[{ required: true, message: 'Raiser can update Campaign Board' }]}
          >
            <Input.TextArea style={{ height: 100 }} />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
              Update
            </Button>
          </Form.Item>
        </Form>
      </Modal>

    </div >
  </>
  )
}
