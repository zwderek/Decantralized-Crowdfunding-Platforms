import { Button, Col, Form, Input, message, Modal, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from "./index.module.css";

import { Campaign } from "../../abi/abi";
import { CampaignFactory } from "../../abi/abi";
import Web3 from "web3";

const web3 = new Web3(Web3.givenProvider);
// Contract address of the deployed smart contract
//const contractAddress = "0x6Fb49C5d778062dC49F6De6b9987fbb060Fbbeaa";
const contractAddress = "0xC2ddBc6138a9150F9ce7409a7099918e90749425"
const campaignFactoryContract = new web3.eth.Contract(CampaignFactory, contractAddress);


export default function SearchList() {

  const [_clist, _setList] = useState([]);
  const _listGet = async (t) => {
    t.preventDefault();
    var ret_list = [];
    const address_list = await campaignFactoryContract.methods.getDeployedCampaigns().call();
    console.log(address_list);
    for (let i = 0; i < address_list.length; i++) {
      const campaignContract = new web3.eth.Contract(Campaign, address_list[i]);
      const campaignSummery = await campaignContract.methods.getSummery().call();
      const campaignDetails = await campaignContract.methods.getDetails().call();
      
      const balance = await web3.eth.getBalance(address_list[i]);
      var tmp = {};
      tmp.id = address_list[i];
      tmp.description = campaignSummery[1];
      tmp.balance = balance;
      tmp.target = campaignSummery[5];
      tmp.lifespan = campaignDetails[1] - campaignDetails[0];
      tmp.is_end = campaignDetails[2];
      tmp.request = [];
      tmp.test = "";
      ret_list.push(tmp);
    }
    console.log("list", ret_list);
    _setList(ret_list);
  }

  //const [list, setList] = useState(localStorage.getItem("campaigns") ? JSON.parse(localStorage.getItem("campaigns")) : []);

  const [showCreate, setShowCreate] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {

    search();
  }, [])

  const search = async () => {

  }

  const onFinish = async (values) => {
    // create a campaign
    
    console.log('Success:', values);
    const accounts = await window.ethereum.enable();
    const account = accounts[0];
    const gas = await campaignFactoryContract.methods.createCampaign(values.description, values.target, values.lifespan).estimateGas();
    const post = await campaignFactoryContract.methods.createCampaign(values.description, values.target, values.lifespan).send({
      from: account,
      gas,
    });
    setShowCreate(false);

    /** 
    list.push({
      id: new Date().getTime() + "_" + Math.random() * 1000,
      ...values,
      requests: []
    });

    setList([...list]);
    localStorage.setItem("campaigns", JSON.stringify(list))
    message.success("Submit Success");
    console.log("list", list)
    setShowCreate(false);
    */
  }

  const onFinishFailed = async () => {

  }

  const connectWallet = async () => {  //testing purpose
    const accounts = await window.ethereum.enable();
    const account = accounts[0];
  }

  const [contributeInput,setContribute] = useState('');
  const handleChange = event => {
    setContribute(event.target.value);
  }
  const handleContributeClick = async (address) => {  //testing purpose
    const accounts = await window.ethereum.enable();
    const account = accounts[0];
    console.log(address);
    console.log(contributeInput);

    const campaignContract = new web3.eth.Contract(Campaign, address);
    //const gas = await campaignContract.methods.contribute().estimateGas();
    const post = await campaignContract.methods.contribute().send({
      from: account,
      value: contributeInput,
    });
  }

  return (<>
    <div className={styles.searchList} >

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#000", padding: 20 }}>
        <span style={{ fontSize: 20, fontWeight: "bold", color: "#fff" }}>D-CrowdFunding Platform</span>
        <div>
          <Button type='primary' style={{ marginRight: 10, backgroundColor: "#fff", color: "#0000ff" }} onClick={() => {
            setShowCreate(true);
          }}>Create Campaign</Button>
          <Button type='primary' style={{}} onClick={_listGet}>Refresh</Button>
        </div>
      </div>

      <div className={styles.listItems}>
        {
          _clist.map((item, index) => {
            return <div key={item.id} className={styles.listItem} onClick={() => {
              navigate("/detail/" + item.id);
            }}>
              <div style={{ padding: 10, boxSizing: "border-box" }} >
                <div>{item.description}</div>
                <div style={{ color: "#888", marginTop: 10 }}>{"balance/target "+item.balance +"/" + item.target}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span>{"is_end_" + item.is_end}</span>

                <Input type='number' onChange={handleChange} value = {contributeInput}  onClick={(e) => {e.stopPropagation();}}></Input>
                <Button type='primary' onClick={(e) => {e.stopPropagation(); handleContributeClick(item.id);}}>Contribute</Button>

              </div>
            </div>
          })
        }
      </div>
      <Modal title="Create Campaign" footer={null} onCancel={() => {
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

          <Row gutter="10">
            <Col>
              <Form.Item
                label="Target"
                name="target"
                rules={[{ required: true, message: 'Please input  target!' }]}
              >
                <Input type='number' />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item
                label="Lifespan"
                name="lifespan"
                rules={[{ required: true, message: 'Please input  lifespan!' }]}
              >
                <Input type='number' />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div >
  </>
  )
}
