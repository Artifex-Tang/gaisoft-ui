// 模型字段映射表
export let modelObjMap = [
  {
    llm_factory: 'OpenAI',
    url: '/v1/llm/set_api_key',
    modelFileds: {
      llm_factory: 'OpenAI',
      api_key: '',
      base_url: '',
    },
    fieldsOptions: [
      {
        label: 'AP- Key',
        prop: 'api_key',
        type: 'input',
        placeholder: '请输入AP- Key',
      },
      {
        label: 'Base URL',
        prop: 'base_url',
        type: 'input',
        placeholder: 'https://api.openai.com/v1',
      }
    ],
    formRules: {
      api_key: [
        { required: true, message: '请输入AP- Key', trigger: 'blur' },
      ],
    }
  },
  {
    llm_factory: 'Moonshot',
    url: '/v1/llm/set_api_key',
    modelFileds: {
      llm_factory: 'Moonshot',
      api_key: '',
    },
    fieldsOptions: [
      {
        label: 'AP- Key',
        prop: 'api_key',
        type: 'input',
        placeholder: '请输入AP- Key',
      }
    ],
    formRules: {
      api_key: [
        { required: true, message: '请输入AP- Key', trigger: 'blur' },
      ],
    }
  },
  {
    llm_factory: 'PPIO',
    url: '/v1/llm/set_api_key',
    modelFileds: {
      llm_factory: 'PPIO',
      api_key: '',
    },
    fieldsOptions: [
      {
        label: 'API-Key',
        prop: 'api_key',
        type: 'input',
        placeholder: '请输入AP- Key',
      }
    ],
    formRules: {
      api_key: [
        { required: true, message: '请输入AP- Key', trigger: 'blur' },
      ],
    }
  },
  {
    llm_factory: 'ZHIPU-AI',
    url: '/v1/llm/set_api_key',
    modelFileds: {
      llm_factory: 'ZHIPU-AI',
      api_key: '',
    },
    fieldsOptions: [
      {
        label: 'AP- Key',
        prop: 'api_key',
        type: 'input',
        placeholder: '请输入AP- Key',
      }
    ],
    formRules: {
      api_key: [
        { required: true, message: '请输入AP- Key', trigger: 'blur' },
      ],
    }
  },
  {
    llm_factory: 'Ollama',
    url: '/v1/llm/add_llm',
    modelFileds: {
      llm_factory: 'Ollama',
      api_key: '',
      api_base: '',
      llm_name: "",
      max_tokens: 0,
      model_type: "",
    },
    fieldsOptions: [
      {
        label: 'API-Key',
        prop: 'api_key',
        type: 'input',
        placeholder: '请输入AP- Key',
      },
      {
        label: '基础 Url',
        prop: 'api_base',
        type: 'input',
        placeholder: '请输入API Base URL',
      },
      {
        label: '模型名称',
        prop: 'llm_name',
        type: 'input',
        placeholder: '请输入模型名称',
      },
      {
        label: '最大token数',
        prop: 'max_tokens',
        type: 'number',
        placeholder: '请输入最大token数',
      },
      {
        label: '模型类型',
        prop: 'model_type',
        type: 'select',
        placeholder: '请选择模型类型',
      }
    ],
    formRules: {
      api_base: [
        { required: true, message: '请输入基础Url', trigger: 'blur' },
      ],
      llm_name: [
        { required: true, message: '请输入模型名称', trigger: 'blur' },
      ],
      max_tokens: [
        { required: true, message: '请输入最大token数', trigger: 'blur' },
      ],
      model_type: [
        { required: true, message: '请选择模型类型', trigger: 'change' },
      ]
    }
  },
  {
    llm_factory: 'Xinference',
    url: '/v1/llm/add_llm',
    modelFileds: {
      llm_factory: 'Xinference',
      api_key: '',
      api_base: '',
      llm_name: "",
      max_tokens: 0,
      model_type: "",
    },
    fieldsOptions: [
      {
        label: 'API-Key',
        prop: 'api_key',
        type: 'input',
        placeholder: '请输入AP- Key',
      },
      {
        label: '基础 Url',
        prop: 'api_base',
        type: 'input',
        placeholder: '请输入API Base URL',
      },
      {
        label: '模型UID',
        prop: 'llm_name',
        type: 'input',
        placeholder: '请输入模型名称',
      },
      {
        label: '最大token数',
        prop: 'max_tokens',
        type: 'number',
        placeholder: '请输入最大token数',
      },
      {
        label: '模型类型',
        prop: 'model_type',
        type: 'select',
        placeholder: '请选择模型类型',
      }
    ],
    formRules: {
      api_base: [
        { required: true, message: '请输入基础Url', trigger: 'blur' },
      ],
      llm_name: [
        { required: true, message: '请输入模型UID', trigger: 'blur' },
      ],
      max_tokens: [
        { required: true, message: '请输入最大token数', trigger: 'blur' },
      ],
      model_type: [
        { required: true, message: '请选择模型类型', trigger: 'change' },
      ]
    }
  },
  {
    llm_factory: '01.AI',
    url: '/v1/llm/set_api_key',
    modelFileds: {
      llm_factory: '01.AI',
      api_key: '',
    },
    fieldsOptions: [
      {
        label: 'AP- Key',
        prop: 'api_key',
        type: 'input',
        placeholder: '请输入AP- Key',
      }
    ],
    formRules: {
      api_key: [
        { required: true, message: '请输入AP- Key', trigger: 'blur' },
      ],
    }
  },
  {
    llm_factory: 'Anthropic',
    url: '/v1/llm/set_api_key',
    modelFileds: {
      llm_factory: 'Anthropic',
      api_key: '',
    },
    fieldsOptions: [
      {
        label: 'AP- Key',
        prop: 'api_key',
        type: 'input',
        placeholder: '请输入AP- Key',
      }
    ],
    formRules: {
      api_key: [
        { required: true, message: '请输入AP- Key', trigger: 'blur' },
      ],
    }
  },
  {
    llm_factory: 'Azure-OpenAI',
    url: '/v1/llm/add_llm',
    modelFileds: {
      llm_factory: 'Azure-OpenAI',
      api_key: '',
      api_base: '',
      api_version: '',
      llm_name: '',
      model_type: '',
      max_tokens: 0
    },
    fieldsOptions: [
      {
        label: 'AP- Key',
        prop: 'api_key',
        type: 'input',
        placeholder: '请输入AP- Key',
      },
      {
        label: 'API Base',
        prop: 'api_base',
        type: 'input',
        placeholder: '请输入API Base URL',
      },
      {
        label: 'API Version',
        prop: 'api_version',
        type: 'input',
        placeholder: '请输入API版本',
      },
      {
        label: '模型名称',
        prop: 'llm_name',
        type: 'input',
        placeholder: '请输入模型名称',
      },
      {
        label: 'Model Type',
        prop: 'model_type',
        type: 'select',
        placeholder: '请选择模型类型',
      },
      {
        label: '最大token数',
        prop: 'max_tokens',
        type: 'number',
        placeholder: '请输入最大token数',
      }
    ],
    formRules: {
      api_base: [
        { required: true, message: '请输入基础Url', trigger: 'blur' },
      ],
      llm_name: [
        { required: true, message: '请输入模型名称', trigger: 'blur' },
      ],
      max_tokens: [
        { required: true, message: '请输入最大token数', trigger: 'blur' },
      ],
      model_type: [
        { required: true, message: '请选择模型类型', trigger: 'change' },
      ]
    }
  },
  {
    llm_factory: 'BaiChuan',
    url: '/v1/llm/set_api_key',
    modelFileds: {
      llm_factory: 'BaiChuan',
      api_key: '',
    },
    fieldsOptions: [
      {
        label: 'AP- Key',
        prop: 'api_key',
        type: 'input',
        placeholder: '请输入AP- Key',
      }
    ],
    formRules: {
      api_key: [
        { required: true, message: '请输入AP- Key', trigger: 'blur' },
      ],
    }
  },
  {
    llm_factory: 'BaiduYiyan',
    url: '/v1/llm/add_llm',
    modelFileds: {
      llm_factory: 'BaiduYiyan',
      yiyan_ak: '',
      yiyan_sk: '',
      llm_name: '',
      model_type: '',
      max_tokens: 0
    },
    fieldsOptions: [
       {
        label: 'Model Type',
        prop: 'model_type',
        type: 'select',
        placeholder: '请选择模型类型',
      },
      {
        label: '一言 API KEY',
        prop: 'yiyan_ak',
        type: 'input',
        placeholder: '请输入一言 API KEY',
      },
      {
        label: '一言 Secret KEY',
        prop: 'yiyan_sk',
        type: 'input',
        placeholder: '请输入一言 Secret KEY',
      },
      {
        label: '模型名称',
        prop: 'llm_name',
        type: 'input',
        placeholder: '请输入模型名称',
      },
      {
        label: '最大token数',
        prop: 'max_tokens',
        type: 'number',
        placeholder: '请输入最大token数',
      }
    ],
    formRules: {
      yiyan_ak: [
        { required: true, message: '请输入Yiyan AK', trigger: 'blur' },
      ],
      yiyan_sk: [
        { required: true, message: '请输入Yiyan SK', trigger: 'blur' },
      ],
      llm_name: [
        { required: true, message: '请输入模型名称', trigger: 'blur' },
      ],
      max_tokens: [
        { required: true, message: '请输入最大token数', trigger: 'blur' },
      ],
      model_type: [
        { required: true, message: '请选择模型类型', trigger: 'change' },
      ]
    }
  },
  {
    llm_factory: 'Bedrock',
    url: '/v1/llm/add_llm',
    modelFileds: {
      llm_factory: 'Bedrock',
      bedrock_ak: '',
      bedrock_region: '',
      bedrock_sk: '',
      llm_name: '',
      max_tokens: 0,
      model_type: ''
    },
    fieldsOptions: [
      {
        label: 'Bedrock AK',
        prop: 'bedrock_ak',
        type: 'input',
        placeholder: '请输入Bedrock AK',
      },
      {
        label: 'AWS Region',
        prop: 'bedrock_region',
        type: 'input',
        placeholder: '请选择AWS Region',
        options:[
          {label: '美国东部（弗吉尼亚北部）', value: 'us-east-1'},
          {label: '美国西部（俄勒冈州）', value: 'us-west-2'},
          {label: '亚太地区（新加坡）', value: 'ap-southeast-1'},
          {label: '亚太地区（东京）', value: 'ap-northeast-1'},
          {label: '欧洲（法兰克福）', value: 'eu-central-1'},
          {label: 'AWS GovCluod（US-West）', value: 'us-gov-west-1'},
          {label: '亚太地区（悉尼）', value: 'ap-southeast-2'}
        ]
      },
      {
        label: 'Bedrock SK',
        prop: 'bedrock_sk',
        type: 'input',
        placeholder: '请输入Bedrock SK',
      },
      {
        label: '模型名称',
        prop: 'llm_name',
        type: 'input',
        placeholder: '请输入模型名称',
      },
      {
        label: 'Model Type',
        prop: 'model_type',
        type: 'select',
        placeholder: '请选择模型类型',
      },
      {
        label: '最大token数',
        prop: 'max_tokens',
        type: 'number',
        placeholder: '请输入最大token数',
      }
    ],
    formRules: {
       bedrock_region: [
        { required: true, message: '请选择bedrock_region', trigger: 'change' },
      ],
      bedrock_ak: [
        { required: true, message: '请输入Bedrock AK', trigger: 'blur' },
      ],
      bedrock_sk: [
        { required: true, message: '请输入Bedrock SK', trigger: 'blur' },
      ],
      llm_name: [
        { required: true, message: '请输入模型名称', trigger: 'blur' },
      ],
      max_tokens: [
        { required: true, message: '请输入最大token数', trigger: 'blur' },
      ],
      model_type: [
        { required: true, message: '请选择模型类型', trigger: 'change' },
      ]
    }
  },
  {
    llm_factory: 'Cohere',
    url: '/v1/llm/set_api_key',
    modelFileds: {
      llm_factory: 'Cohere',
      api_key: '',
    },
    fieldsOptions: [
      {
        label: 'AP- Key',
        prop: 'api_key',
        type: 'input',
        placeholder: '请输入AP- Key',
      }
    ],
    formRules: {
      api_key: [
        { required: true, message: '请输入AP- Key', trigger: 'blur' },
      ],
    }
  },
  {
    llm_factory: 'DeepSeek',
    url: '/v1/llm/set_api_key',
    modelFileds: {
      llm_factory: 'DeepSeek',
      api_key: '',
    },
    fieldsOptions: [
      {
        label: 'AP- Key',
        prop: 'api_key',
        type: 'input',
        placeholder: '请输入AP- Key',
      }
    ],
    formRules: {
      api_key: [
        { required: true, message: '请输入AP- Key', trigger: 'blur' },
      ],
    }
  },
  {
    llm_factory: 'Fish Audio',
    url: '/v1/llm/add_llm',
    modelFileds: {
      llm_factory: 'Fish Audio',
      fish_audio_refid: '',
      fish_audio_ak: '',
      llm_name: '',
      max_tokens: 0,
      model_type: ''
    },
    fieldsOptions: [
      {
        label: 'FishAudio Refrence ID',
        prop: 'fish_audio_refid',
        type: 'input',
        placeholder: '请输入Fish Audio Refid',
      },
      {
        label: 'Fish Audio API KEY',
        prop: 'fish_audio_ak',
        type: 'input',
        placeholder: '请输入Fish Audio AK',
      },
      {
        label: '模型名称',
        prop: 'llm_name',
        type: 'input',
        placeholder: '请输入模型名称',
      },
      {
        label: '模型类型',
        prop: 'model_type',
        type: 'select',
        placeholder: '请选择模型类型',
      },
      {
        label: '最大token数',
        prop: 'max_tokens',
        type: 'number',
        placeholder: '请输入最大token数',
      }
    ],
    formRules: {
      fish_audio_refid: [
        { required: true, message: '请输入Fish Audio Refid', trigger: 'blur' },
      ],
      fish_audio_ak: [
        { required: true, message: '请输入Fish Audio AK', trigger: 'blur' },
      ],
      llm_name: [
        { required: true, message: '请输入模型名称', trigger: 'blur' },
      ],
      max_tokens: [
        { required: true, message: '请输入最大token数', trigger: 'blur' },
      ],
      model_type: [
        { required: true, message: '请选择模型类型', trigger: 'change' },
      ]
    }
  },
  {
    llm_factory: 'Gemini',
    url: '/v1/llm/set_api_key',
    modelFileds: {
      llm_factory: 'Gemini',
      api_key: '',
    },
    fieldsOptions: [
      {
        label: 'AP- Key',
        prop: 'api_key',
        type: 'input',
        placeholder: '请输入AP- Key',
      }
    ],
    formRules: {
      api_key: [
        { required: true, message: '请输入AP- Key', trigger: 'blur' },
      ],
    }
  },

  {
    llm_factory: 'GPUStack',
    url: '/v1/llm/add_llm',
    modelFileds: {
      llm_factory: 'GPUStack',
      api_base: '',
      api_key: '',
      llm_name: '',
      max_tokens: 0,
      model_type: ''
    },
    fieldsOptions: [
      {
        label: 'API Base',
        prop: 'api_base',
        type: 'input',
        placeholder: '请输入API Base URL',
      },
      {
        label: 'API- Key',
        prop: 'api_key',
        type: 'input',
        placeholder: '请输入API- Key',
      },
      {
        label: '模型名称',
        prop: 'llm_name',
        type: 'input',
        placeholder: '请输入模型名称',
      },
      {
        label: '最大token数',
        prop: 'max_tokens',
        type: 'number',
        placeholder: '请输入最大token数',
      },
      {
        label: 'Model Type',
        prop: 'model_type',
        type: 'select',
        placeholder: '请选择模型类型',
      }
    ],
    formRules: {
      api_key: [
        { required: true, message: '请输入AP- Key', trigger: 'blur' },
      ],
      llm_name: [
        { required: true, message: '请输入模型名称', trigger: 'blur' },
      ],
      max_tokens: [
        { required: true, message: '请输入最大token数', trigger: 'blur' },
      ],
      model_type: [
        { required: true, message: '请选择模型类型', trigger: 'change' },
      ]
    }
  },
  {
    llm_factory: 'Groq',
    url: '/v1/llm/set_api_key',
    modelFileds: {
      llm_factory: 'Groq',
      api_key: '',
    },
    fieldsOptions: [
      {
        label: 'AP- Key',
        prop: 'api_key',
        type: 'input',
        placeholder: '请输入AP- Key',
      }
    ],
    formRules: {
      api_key: [
        { required: true, message: '请输入AP- Key', trigger: 'blur' },
      ],
    }
  },
  {
    llm_factory: 'HuggingFace',
    url: '/v1/llm/add_llm',
    modelFileds: {
      llm_factory: 'HuggingFace',
      api_base: '',
      api_key: '',
      llm_name: '',
      max_tokens: 0,
      model_type: ''
    },
    fieldsOptions: [
      {
        label: 'API Base',
        prop: 'api_base',
        type: 'input',
        placeholder: '请输入API Base URL',
      },
      {
        label: 'AP- Key',
        prop: 'api_key',
        type: 'input',
        placeholder: '请输入AP- Key',
      },
      {
        label: '模型名称',
        prop: 'llm_name',
        type: 'input',
        placeholder: '请输入模型名称',
      },
      {
        label: '最大token数',
        prop: 'max_tokens',
        type: 'number',
        placeholder: '请输入最大token数',
      },
      {
        label: 'Model Type',
        prop: 'model_type',
        type: 'select',
        placeholder: '请选择模型类型',
      }
    ],
    formRules: {
      api_base: [
        { required: true, message: '请输入基础Url', trigger: 'blur' },
      ],
      llm_name: [
        { required: true, message: '请输入模型名称', trigger: 'blur' },
      ],
      max_tokens: [
        { required: true, message: '请输入最大token数', trigger: 'blur' },
      ],
      model_type: [
        { required: true, message: '请选择模型类型', trigger: 'change' },
      ]
    }
  },
  {
    llm_factory: 'Jina',
    url: '/v1/llm/set_api_key',
    modelFileds: {
      llm_factory: 'Jina',
      api_key: '',
    },
    fieldsOptions: [
      {
        label: 'AP- Key',
        prop: 'api_key',
        type: 'input',
        placeholder: '请输入AP- Key',
      }
    ],
    formRules: {
      api_key: [
        { required: true, message: '请输入AP- Key', trigger: 'blur' },
      ],
    }
  },
  {
    llm_factory: 'LeptonAI',
    url: '/v1/llm/set_api_key',
    modelFileds: {
      llm_factory: 'LeptonAI',
      api_key: '',
    },
    fieldsOptions: [
      {
        label: 'AP- Key',
        prop: 'api_key',
        type: 'input',
        placeholder: '请输入AP- Key',
      }
    ],
    formRules: {
      api_key: [
        { required: true, message: '请输入AP- Key', trigger: 'blur' },
      ],
    }
  },
  {
    llm_factory: 'LM-Studio',
    url: '/v1/llm/add_llm',
    modelFileds: {
      llm_factory: 'LM-Studio',
      api_base: '',
      api_key: '',
      llm_name: '',
      max_tokens: 0,
      model_type: ''
    },
    fieldsOptions: [
      {
        label: 'API Base',
        prop: 'api_base',
        type: 'input',
        placeholder: '请输入API Base URL',
      },
      {
        label: 'AP- Key',
        prop: 'api_key',
        type: 'input',
        placeholder: '请输入AP- Key',
      },
      {
        label: '模型名称',
        prop: 'llm_name',
        type: 'input',
        placeholder: '请输入模型名称',
      },
      {
        label: '最大token数',
        prop: 'max_tokens',
        type: 'number',
        placeholder: '请输入最大token数',
      },
      {
        label: 'Model Type',
        prop: 'model_type',
        type: 'select',
        placeholder: '请选择模型类型',
      }
    ],
    formRules: {
      api_key: [
        { required: true, message: '请输入AP- Key', trigger: 'blur' },
      ],
      llm_name: [
        { required: true, message: '请输入模型名称', trigger: 'blur' },
      ],
      max_tokens: [
        { required: true, message: '请输入最大token数', trigger: 'blur' },
      ],
      model_type: [
        { required: true, message: '请选择模型类型', trigger: 'change' },
      ]
    }
  },
  {
    llm_factory: 'LocalAI',
    url: '/v1/llm/add_llm',
    modelFileds: {
      llm_factory: 'LocalAI',
      api_base: '',
      api_key: '',
      llm_name: '',
      max_tokens: 0,
      model_type: ''
    },
    fieldsOptions: [
      {
        label: 'API Base',
        prop: 'api_base',
        type: 'input',
        placeholder: '请输入API Base URL',
      },
      {
        label: 'AP- Key',
        prop: 'api_key',
        type: 'input',
        placeholder: '请输入AP- Key',
      },
      {
        label: '模型名称',
        prop: 'llm_name',
        type: 'input',
        placeholder: '请输入模型名称',
      },
      {
        label: '最大token数',
        prop: 'max_tokens',
        type: 'number',
        placeholder: '请输入最大token数',
      },
      {
        label: 'Model Type',
        prop: 'model_type',
        type: 'select',
        placeholder: '请选择模型类型',
      }
    ],
    formRules: {
      api_base: [
        { required: true, message: '请输入基础Url', trigger: 'blur' },
      ],
      llm_name: [
        { required: true, message: '请输入模型名称', trigger: 'blur' },
      ],
      max_tokens: [
        { required: true, message: '请输入最大token数', trigger: 'blur' },
      ],
      model_type: [
        { required: true, message: '请选择模型类型', trigger: 'change' },
      ]
    }
  },
  {
    llm_factory: 'MiniMax',
    url: '/v1/llm/set_api_key',
    modelFileds: {
      llm_factory: 'MiniMax',
      api_key: '',
      group_id: '',
    },
    fieldsOptions: [
      {
        label: 'AP- Key',
        prop: 'api_key',
        type: 'input',
        placeholder: '请输入AP- Key',
      },
      {
        label: 'Group ID',
        prop: 'group_id',
        type: 'input',
        placeholder: '请输入Group ID',
      }
    ],
    formRules: {
      api_key: [
        { required: true, message: '请输入AP- Key', trigger: 'blur' },
      ]
    }
  },
  {
    llm_factory: 'Mistral',
    url: '/v1/llm/set_api_key',
    modelFileds: {
      llm_factory: 'Mistral',
      api_key: '',
    },
    fieldsOptions: [
      {
        label: 'AP- Key',
        prop: 'api_key',
        type: 'input',
        placeholder: '请输入AP- Key',
      }
    ],
    formRules: {
      api_key: [
        { required: true, message: '请输入AP- Key', trigger: 'blur' },
      ],
    }
  },
  {
    llm_factory: 'ModelScope',
    url: '/v1/llm/add_llm',
    modelFileds: {
      llm_factory: 'ModelScope',
      api_base: '',
      api_key: '',
      llm_name: '',
      max_tokens: 0,
      model_type: ''
    },
    fieldsOptions: [
      {
        label: 'API Base',
        prop: 'api_base',
        type: 'input',
        placeholder: '请输入API Base URL',
      },
      {
        label: 'AP- Key',
        prop: 'api_key',
        type: 'input',
        placeholder: '请输入AP- Key',
      },
      {
        label: '模型名称',
        prop: 'llm_name',
        type: 'input',
        placeholder: '请输入模型名称',
      },
      {
        label: '最大token数',
        prop: 'max_tokens',
        type: 'number',
        placeholder: '请输入最大token数',
      },
      {
        label: 'Model Type',
        prop: 'model_type',
        type: 'select',
        placeholder: '请选择模型类型',
      }
    ],
    formRules: {
      api_base: [
        { required: true, message: '请输入基础URL', trigger: 'blur' },
      ],
      llm_name: [
        { required: true, message: '请输入模型名称', trigger: 'blur' },
      ],
      max_tokens: [
        { required: true, message: '请输入最大token数', trigger: 'blur' },
      ],
      model_type: [
        { required: true, message: '请选择模型类型', trigger: 'change' },
      ]
    }
  },
  {
    llm_factory: 'NovitaAI',
    url: '/v1/llm/set_api_key',
    modelFileds: {
      llm_factory: 'NovitaAI',
      api_key: '',
    },
    fieldsOptions: [
      {
        label: 'AP- Key',
        prop: 'api_key',
        type: 'input',
        placeholder: '请输入AP- Key',
      }
    ],
    formRules: {
      api_key: [
        { required: true, message: '请输入AP- Key', trigger: 'blur' },
      ],
    }
  },
  {
    llm_factory: 'NVIDIA',
    url: '/v1/llm/set_api_key',
    modelFileds: {
      llm_factory: 'NVIDIA',
      api_key: '',
    },
    fieldsOptions: [
      {
        label: 'AP- Key',
        prop: 'api_key',
        type: 'input',
        placeholder: '请输入AP- Key',
      }
    ],
    formRules: {
      api_key: [
        { required: true, message: '请输入AP- Key', trigger: 'blur' },
      ],
    }
  },
  {
    llm_factory: 'OpenAI-API-Compatible',
    url: '/v1/llm/add_llm',
    modelFileds: {
      llm_factory: 'OpenAI-API-Compatible',
      api_base: '',
      api_key: '',
      llm_name: '',
      max_tokens: 0,
      model_type: ''
    },
    fieldsOptions: [
      {
        label: 'API Base',
        prop: 'api_base',
        type: 'input',
        placeholder: '请输入API Base URL',
      },
      {
        label: 'AP- Key',
        prop: 'api_key',
        type: 'input',
        placeholder: '请输入AP- Key',
      },
      {
        label: '模型名称',
        prop: 'llm_name',
        type: 'input',
        placeholder: '请输入模型名称',
      },
      {
        label: '最大token数',
        prop: 'max_tokens',
        type: 'number',
        placeholder: '请输入最大token数',
      },
      {
        label: 'Model Type',
        prop: 'model_type',
        type: 'select',
        placeholder: '请选择模型类型',
      }
    ],
    formRules: {
      api_base: [
        { required: true, message: '请输入基础URL', trigger: 'blur' },
      ],
      llm_name: [
        { required: true, message: '请输入模型名称', trigger: 'blur' },
      ],
      max_tokens: [
        { required: true, message: '请输入最大token数', trigger: 'blur' },
      ],
      model_type: [
        { required: true, message: '请选择模型类型', trigger: 'change' },
      ]
    }
  },
  {
    llm_factory: 'OpenRouter',
    url: '/v1/llm/add_llm',
    modelFileds: {
      llm_factory: 'OpenRouter',
      api_base: '',
      api_key: '',
      llm_name: '',
      max_tokens: 0,
      model_type: ''
    },
    fieldsOptions: [
      {
        label: 'API Base',
        prop: 'api_base',
        type: 'input',
        placeholder: '请输入API Base URL',
      },
      {
        label: 'AP- Key',
        prop: 'api_key',
        type: 'input',
        placeholder: '请输入AP- Key',
      },
      {
        label: '模型名称',
        prop: 'llm_name',
        type: 'input',
        placeholder: '请输入模型名称',
      },
      {
        label: '最大token数',
        prop: 'max_tokens',
        type: 'number',
        placeholder: '请输入最大token数',
      },
      {
        label: 'Model Type',
        prop: 'model_type',
        type: 'select',
        placeholder: '请选择模型类型',
      }
    ],
    formRules: {
      api_base: [
        { required: true, message: '请输入基础Url', trigger: 'blur' },
      ],
      llm_name: [
        { required: true, message: '请输入模型名称', trigger: 'blur' },
      ],
      max_tokens: [
        { required: true, message: '请输入最大token数', trigger: 'blur' },
      ],
      model_type: [
        { required: true, message: '请选择模型类型', trigger: 'change' },
      ]
    }
  },
  {
    llm_factory: 'PerfXCloud',
    url: '/v1/llm/set_api_key',
    modelFileds: {
      llm_factory: 'PerfXCloud',
      api_key: '',
    },
    fieldsOptions: [
      {
        label: 'AP- Key',
        prop: 'api_key',
        type: 'input',
        placeholder: '请输入AP- Key',
      }
    ],
    formRules: {
      api_key: [
        { required: true, message: '请输入AP- Key', trigger: 'blur' },
      ],
    }
  },
  {
    llm_factory: 'Replicate',
    url: '/v1/llm/add_llm',
    modelFileds: {
      llm_factory: 'Replicate',
      api_base: '',
      api_key: '',
      llm_name: '',
      max_tokens: 0,
      model_type: ''
    },
    fieldsOptions: [
      {
        label: 'API Base',
        prop: 'api_base',
        type: 'input',
        placeholder: '请输入API Base URL',
      },
      {
        label: 'AP- Key',
        prop: 'api_key',
        type: 'input',
        placeholder: '请输入AP- Key',
      },
      {
        label: '模型名称',
        prop: 'llm_name',
        type: 'input',
        placeholder: '请输入模型名称',
      },
      {
        label: '最大token数',
        prop: 'max_tokens',
        type: 'number',
        placeholder: '请输入最大token数',
      },
      {
        label: 'Model Type',
        prop: 'model_type',
        type: 'select',
        placeholder: '请选择模型类型',
      }
    ],
    formRules: {
      api_base: [
        { required: true, message: '请输入基础Url', trigger: 'blur' },
      ],
      llm_name: [
        { required: true, message: '请输入模型名称', trigger: 'blur' },
      ],
      max_tokens: [
        { required: true, message: '请输入最大token数', trigger: 'blur' },
      ],
      model_type: [
        { required: true, message: '请选择模型类型', trigger: 'change' },
      ]
    }
  },
  {
    llm_factory: 'SILICONFLOW',
    url: '/v1/llm/set_api_key',
    modelFileds: {
      llm_factory: 'SILICONFLOW',
      api_key: '',
    },
    fieldsOptions: [
      {
        label: 'AP- Key',
        prop: 'api_key',
        type: 'input',
        placeholder: '请输入AP- Key',
      }
    ],
    formRules: {
      api_key: [
        { required: true, message: '请输入AP- Key', trigger: 'blur' },
      ],
    }
  },
  {
    llm_factory: 'StepFun',
    url: '/v1/llm/set_api_key',
    modelFileds: {
      llm_factory: 'StepFun',
      api_key: '',
    },
    fieldsOptions: [
      {
        label: 'AP- Key',
        prop: 'api_key',
        type: 'input',
        placeholder: '请输入AP- Key',
      }
    ],
    formRules: {
      api_key: [
        { required: true, message: '请输入AP- Key', trigger: 'blur' },
      ],
    }
  },

  {
    llm_factory: 'Tencent Hunyuan',
    url: '/v1/llm/add_llm',
    modelFileds: {
      llm_factory: 'Tencent Hunyuan',
      hunyuan_sid: "",
      hunyuan_sk: "",
    },
    fieldsOptions: [
      {
        label: '混元 Secret ID',
        prop: 'hunyuan_sid',
        type: 'input',
        placeholder: '请输入Hunyuan SID',
      },
      {
        label: '混元 Secret Key',
        prop: 'hunyuan_sk',
        type: 'input',
        placeholder: '请输入Hunyuan SK',
      }
    ],
    formRules: {
      hunyuan_sid: [
        { required: true, message: '请输入Hunyuan SID', trigger: 'blur' },
      ],
      hunyuan_sk: [
        { required: true, message: '请输入Hunyuan SK', trigger: 'blur' },
      ]
    }
  },
  {
    llm_factory: 'TogetherAI',
    url: '/v1/llm/add_llm',
    modelFileds: {
      llm_factory: 'TogetherAI',
      api_base: "",
      api_key: "",
      llm_name: "",
      max_tokens: 0,
      model_type: '',
    },
    fieldsOptions: [
      {
        label: 'API Base',
        prop: 'api_base',
        type: 'input',
        placeholder: '请输入API Base URL',
      },
      {
        label: 'AP- Key',
        prop: 'api_key',
        type: 'input',
        placeholder: '请输入AP- Key',
      },
      {
        label: '模型名称',
        prop: 'llm_name',
        type: 'input',
        placeholder: '请输入模型名称',
      },
      {
        label: '最大token数',
        prop: 'max_tokens',
        type: 'number',
        placeholder: '请输入最大token数',
      },
      {
        label: 'Model Type',
        prop: 'model_type',
        type: 'select',
        placeholder: '请选择模型类型',
      }
    ],
    formRules: {
      api_base: [
        { required: true, message: '请输入基础Url', trigger: 'blur' },
      ],
      llm_name: [
        { required: true, message: '请输入模型名称', trigger: 'blur' },
      ],
      max_tokens: [
        { required: true, message: '请输入最大token数', trigger: 'blur' },
      ],
      model_type: [
        { required: true, message: '请选择模型类型', trigger: 'change' },
      ]
    }
  },
  {
    llm_factory: 'Tongyi-Qianwen',
    url: '/v1/llm/set_api_key',
    modelFileds: {
      llm_factory: 'Tongyi-Qianwen',
      api_key: '',
    },
    fieldsOptions: [
      {
        label: 'AP- Key',
        prop: 'api_key',
        type: 'input',
        placeholder: '请输入AP- Key',
      }
    ],
    formRules: {
      api_key: [
        { required: true, message: '请输入AP- Key', trigger: 'blur' },
      ],
    }
  },
  {
    llm_factory: 'Upstage',
    url: '/v1/llm/set_api_key',
    modelFileds: {
      llm_factory: 'Upstage',
      api_key: '',
    },
    fieldsOptions: [
      {
        label: 'AP- Key',
        prop: 'api_key',
        type: 'input',
        placeholder: '请输入AP- Key',
      }
    ],
    formRules: {
      api_key: [
        { required: true, message: '请输入AP- Key', trigger: 'blur' },
      ],
    }
  },
  {
    llm_factory: 'VLLM',
    url: '/v1/llm/add_llm',
    modelFileds: {
      llm_factory: 'VLLM',
      api_base: "",
      api_key: "",
      llm_name: "",
      max_tokens: 0,
      model_type: '',
    },
    fieldsOptions: [
      {
        label: 'API Base',
        prop: 'api_base',
        type: 'input',
        placeholder: '请输入API Base URL',
      },
      {
        label: 'AP- Key',
        prop: 'api_key',
        type: 'input',
        placeholder: '请输入AP- Key',
      },
      {
        label: '模型名称',
        prop: 'llm_name',
        type: 'input',
        placeholder: '请输入模型名称',
      },
      {
        label: '最大token数',
        prop: 'max_tokens',
        type: 'number',
        placeholder: '请输入最大token数',
      },
      {
        label: 'Model Type',
        prop: 'model_type',
        type: 'select',
        placeholder: '请选择模型类型',
      }
    ],
    formRules: {
      api_base: [
        { required: true, message: '请输入基础url', trigger: 'blur' },
      ],
      llm_name: [
        { required: true, message: '请输入模型名称', trigger: 'blur' },
      ],
      max_tokens: [
        { required: true, message: '请输入最大token数', trigger: 'blur' },
      ],
      model_type: [
        { required: true, message: '请选择模型类型', trigger: 'change' },
      ]
    }
  },
  {
    llm_factory: 'VolcEngine',
    url: '/v1/llm/add_llm',
    modelFileds: {
      llm_factory: 'VolcEngine',
      ark_api_key: "",
      endpoint_id: "",
      llm_name: "",
      max_tokens: 0,
      model_type: '',
    },
    fieldsOptions: [
      {
        label: '火山 ARK_API_KEY',
        prop: 'ark_api_key',
        type: 'input',
        placeholder: '请输入Ark AP- Key',
      },
      {
        label: '模型 EndpointID',
        prop: 'endpoint_id',
        type: 'input',
        placeholder: '请输入Endpoint ID',
      },
      {
        label: '模型名称',
        prop: 'llm_name',
        type: 'input',
        placeholder: '请输入模型名称',
      },
      {
        label: '最大token数',
        prop: 'max_tokens',
        type: 'number',
        placeholder: '请输入最大token数',
      },
      {
        label: 'Model Type',
        prop: 'model_type',
        type: 'select',
        placeholder: '请选择模型类型',
      }
    ],
    formRules: {
      ark_api_key: [
        { required: true, message: '请输入Ark AP- Key', trigger: 'blur' },
      ],
      endpoint_id: [
        { required: true, message: '请输入Endpoint ID', trigger: 'blur' },
      ],
      llm_name: [
        { required: true, message: '请输入模型名称', trigger: 'blur' },
      ],
      max_tokens: [
        { required: true, message: '请输入最大token数', trigger: 'blur' },
      ],
      model_type: [
        { required: true, message: '请选择模型类型', trigger: 'change' },
      ]
    }
  },
  {
    llm_factory: 'Voyage AI',
    url: '/v1/llm/set_api_key',
    modelFileds: {
      llm_factory: 'Voyage AI',
      api_key: '',
    },
    fieldsOptions: [
      {
        label: 'AP- Key',
        prop: 'api_key',
        type: 'input',
        placeholder: '请输入AP- Key',
      }
    ],
    formRules: {
      api_key: [
        { required: true, message: '请输入AP- Key', trigger: 'blur' },
      ],
    }
  },

];