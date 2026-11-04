// ==========================================================================
// Cat Gaze 購物車、雲端商品中控串流 ＆「🐈 AI 巧遇店長（✨巧遇動畫 ＋ 🎨巧遇插畫雙模版）」
// 1. 購物車同步 (localStorage + Firebase carts)
// 2. 訂單與會員查詢雙向相容 (Firebase orders)
// 3. 支援試算表「G欄：主分類專區」、「H欄：細項子分類」、「I欄：首頁與新品曝光」全中文下拉選單解析
// 4. 全站右下角自動載入「🐈 AI 巧遇店長」（100% 零破圖 Canvas 即時合成眨眼動畫引擎）
// ==========================================================================

const firebaseConfig = {
    apiKey: "AIzaSyCe9jsOgigX1Ok4sMbr1P2o4RcSM15BI_U",
    authDomain: "cat-gaze-bonsai.firebaseapp.com",
    databaseURL: "https://cat-gaze-bonsai-default-rtdb.firebaseio.com",
    projectId: "cat-gaze-bonsai",
    storageBucket: "cat-gaze-bonsai.firebasestorage.app",
    messagingSenderId: "411112352421",
    appId: "1:411112352421:web:265bd6e1372df985cefb4c",
    measurementId: "G-8ZW69YQQN0"
};

const CATGAZE_SHEET_ID = "128TMT_BQmWfIwZGH01UrU_WoHm5W_STX26DkP9MeDN0";
const CATGAZE_LINE_ID = "@201zilzp";
const CATGAZE_LINE_URL = "https://line.me/R/ti/p/@201zilzp";
const CATGAZE_LINE_OA_MSG_URL = "https://line.me/R/oaMessage/@201zilzp/?";

// 🐾 巧遇店長無損驗證插畫基底與輕量眨眼貼片 (透過 Canvas 即時無縫合成，100% 杜絕色塊破圖)
const QIAOYU_MEDIA = {
    // 已驗證 100% 清晰無損的巧遇正面綠眼凝視插畫 (160x160)
    illus_open: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBAUEBAYFBQUGBgYHCQ4JCQgICRINDQoOFRIWFhUSFBQXGiEcFxgfGRQUHScdHyIjJSUlFhwpLCgkKyEkJST/2wBDAQYGBgkICREJCREkGBQYJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCT/wAARCACgAKADASIAAhEBAxEB/8QAHAAAAgMAAwEAAAAAAAAAAAAABgcDBAUAAQII/8QARxAAAQMCBQEGAwQFCgUEAwAAAQIDBAURAAYSITFBBxMiUWFxFDKBQpGhsRUjUmJyCBYkMzVTc4KS8BdDosHRJTRE4WPC8f/EABoBAAMBAQEBAAAAAAAAAAAAAAIDBAEABQb/xAAjEQACAgEFAAMBAQEAAAAAAAABAgARAwQSITEyIkFRE2Ej/9oADAMBAAIRAxEAPwA6h5XrjaO7UywEjjU7wPoMXmsr1QnxuQ0f6lYLccx87QnpbzFlLyTUY2ZGX0yG0pfcA1ob2G2+DNugSEDxVJW37LSRjZKQq1wCQbj0xg5+mPQcoVFcZ0svvJRGQ4k2KC4tKCQehAUbeuCqzUzcZDAdo1UfMaLmNmW+k2Uy1KQXAf4Qb/hjQ/m9BJ8Ydc/icOE+igx5FLbLLDaEpAU22GkkIHS3UG3UEH1wSZR7QZNNcECvPKeiJHhlOEqcjji6z/zG/wB/5kfauPFjqB6hsrL3D5OX6YlWsQ2yrzNzfEyaVBR8sRkf5Ri2NxcEEEXBBuCMctjIu5EiMy38rSE+yRjw9T4khWp2O2tXmRvixiZqMpR32Hljp1xXVFhKZ0tKEJAS4QABwMHuSYRM5t1bYCQwRe3PGMk0IOT5TjosjvCQPPBxRkJbebSkAAN7DDMQ+Ym5G+M2QhKeEgfTHeOY5i+RzmOcYgnTotNiPTJshqNGYQXHXnVBKG0jkknYDCezJ2x1SsyzByohUOL0mOMhch0dFJbV4WknoVgqPRI5xjMFFmaqljQjox1hF0OsZloddp82bXKpKacebRKYmPBxC2lLCFEbDQpJUFeEAEAj2epHTGI4cWIT4yhowU7S2e+yq9+64hX44T84aJCeflw689JC8sTARfYH8cJeptnvgvppGI9T7lWnPxjcxzHWO8KgzvjAt2li+UJC9/BJiq2/x0D/AL4KDjAz8wZOSq2hIupMRTyR6tkOf/pgl7E6BGWPHBh6ue7TwL3IFsRZpy+40kTmCptaDr1adOlXncCw+oseCceqI8GYzRbKDoKgnULj5j0wUxqiiQkIeUllxe2xSPwvf8MCJXlB7g3kPOyaSr9E1FQagJKUoUo7QSo2SL/3Cj8p+wfCfDYhqpbWo6QCLc4TOZqE/RpfxzbLC0eLxJSO7WlWym3E8BKuCRtwSBydCgdqxyjT4aJkV+q0B493EkIX/SIhHMdzVsvSPlJIJAtclODAuSsK5EcMaGSRYXPnjUjw0osTucD1M7SsmTYbUlrMEBpDg2S8vu1pPkUq3BxNJ7SsnRFBLuY6dc7+BzX+QNsUJiA5MnZyepUmpAkyNvtnGxST/Sm/8M4BXO0DK8qS8W61FCVL2UrUkH6kYKKPmKimS0sVimlKmzY/FI3/ABwtAQ8Y3mFmK9RqMSkQH58+Q1Fix0Fx151WlKEjkk4Hszdp+UMpRfiKnW4gJTqSywsOuLHmEpvYepsPXCP7Rc/1XPEqMypldMg7PxIDputI6SZAG2rfwN9CQTc/LWzACzEqhY0JYz1naf2i1RMVnvItKZWFMRljcHkPOp+06eUNnZsHUrxWA3MrUJNLY71IRc73KytVzyVHqo9ScZ2ScuBhCT8E+lF7kvnxLvySL6jc+Ywa1FaWY2hl7RfZSEgAH7sQ5HLcmX4kC/EQerqi4gKQTdOrgeVv+9sPNXJ9zhKsxfjJUJjnv5kdnnoXUKV/0oVh1E33w3SeSf8AYrW+wJh5yAVl2WD1ThM1RBC3Bbiww6M3AGhSAeth+OE9UUan3R5ugYVqfQnafzGbjmOXxzC5k5jyttt1tTTqdTS0lC0+aSLEfcTj0ElWwGJksADfc46dEbR0mE/Lpi3g4uC8uMpQ/abOg/eAhX+bBhSXwlSSj4dHmp5xafpdIt9MAs69MzdnCc4FhAq7kcI4GpV1lVvPTYD3xZhfE1mUgQE91HTu/KVwn92/I246ccdSYU0rDA4xDHNdSgCHZ5xhUhSCUNtr8To8gDY4UNNi1Jhis02dFC4c+5bjrXYpWNwoEcG+4I4IGC2bmWBTFri0+MicUGy5Dp63IPi/a2ttt5jGYiLKmOJeelBzvSHGFoRoCVp4Ta+3kRvyDxjgxiSIDkMUJJcq8tL8ZAI7kbKeOni4438sYT1XErK9IU2ltMpUt5hxwfM4kJunUfckfTBtnOkw00mpqdcbjRy2Vh9SNRSk2IsOb2On3wN02iR2+z6nzYKErU9PS0+45YqbBJBPkk30j0B5xXjYVuP7EOOaEG01KaWErQ8rvFKQ2kE7alGw2wWu1KkrzXOp8VtttMSKUM67qS7ICRqUR5fNYcbXxUylSnanUabG+FS4hclxbr2jdtCEc387qSB748wKA0z2lVVpUhiSGlF9Go3K0m2lSSNrgmxBwbEG/wDBAAIqa2XICGJztUqLTcpEUB1mMgam1rHC1+diQEpPU3PGNrKEmTVq+9JqCf1rjxW4t4nxK3CUD6XJ9zi3IhKisNpjWSpZDxTpvq3ISm3qdR29MbNDqkFAYp1dp8aRoJAUlsKSySdyo/aPnbbpviRnJlKrUZtJhxlQLhbKHBe1gqw+oP8A3xjVBbqJK0vhOropCypKk+Yvv+JxVkLfp7SpkBxUimd1q0pWE6CCNwAL+mkDnbbjGZGqMMrbkOPqDL7qUagb2ubXH++mEnkcSjEObMM8iRzUszxFjdqGh2Wo22vYso+8qe/0Ya2Fj2JtvD+cplJAkNTkRlW+ylDfhSPQX29yeScM/F2JQqATzdQ+7ITMXNZ/9JKf23Ej8cKOQQZq/wDGvhtZt/8AYMjzeThQz1FD6yP2yRiTUe4/T+YyziRDRVudhj2hsDpc4tMxlOb8DAzLkTbd/CgHF6PEA3VucTMx0tjjEq1pbQpa1BKUgqUTwAOThyYv2LZ/yfNPb3UGKLniZAhOBQqUSNLltpO7UlJLaDccFSEpv/CDjGFZECkCkxgplyyXJTiRZV9/CLbX4vbbni+Kmb6mjNOaKnnBpKgZroTTWnt7NpAQhZF+SAVAXsNXmTiFmKGXo0PWpXg1OLcIOpRxuWvqOx3XMsqKYrbbkgtsNFOpI4uPP/fHXFnIdWGdEzktoW0wwUhSCNwoX0uJI6g7EeR9sEUzK1KiUdL9bkxYxWnwPyXA2lBI81W2xR7JKDCo1Tnpo+ZKVVIMiy/g40lDriFD7Q68bcWIwta2E/cI3uAgtl+urzn2jy6PKhsyaVGKyppSdSbtLuFHzurpigWI9Co3aBlyU8ttmnykzI6kmytK1Apt9Qj78FPZ3lOXkzNWbHqiw6GXHUiNJWnwvNqUtdwfPgH1GM/OFHhVar1eqx1F9U6G3FLA6kXBWb7E2tbytfDv6KH2jriBsYrZ75g5lSqIolIzJWg6kyabDDTSb3Gt5RUD9+kfTFiVQW8h9m1LrgjaqzJIKn1C/dB7x6T/AJUge5OI05EjOZedpTS3kLfcZcWtR2VoUdifMpUfqkYPO0/4aqdmdQZipL6m+5LLbQ1KulaQNvbGtkXcAPszAhok/QkInPTskM5liMJUtTIUE72bQNlHzFgLA+ZOMqnSYtYZ+Npz6VuItqQk3A24/wDvBacj5h/4QRMrwkBue7HQ3LcPDSSdSk7ckA6fv3GMPKnZbIoyEpK3Ud3/AMwqslw+ZHX0HGEtsom/uGu6wJdy3mddHe0S1IFNcP65tQuEX5V6Dz6WvyTjNzKyzEzaxDcmtNU9xfxaW0uFWlokG1hwDb67gbG2JZ0UsVAxHe6VqOlZA+b/AM4zm6a7OqKIkt5UeXCdS5Gk6btFJ2CFDfba3pf0wCkdxhufSPZfGWrLrlZdQlt2uSV1Iti36tCgEtpPqG0Jv6k4MMBfZIpxnJkemSLJk0x12I6i9yiyipI/0qTbzFsGeLxVCp5rXZuY2a03p7Z8nk4UVTbPeufurP54cGZv7MuejiT+OFLVE3dlgdCfzxDqPcs0/mNmPD3urfF5CAgWGPQFhYY5h6oFiC1zmArtmqkikdmlbfiuIbfdaTGTflXeKCCE/vEKNsGpwt/5QepPZZUnQ4lvun4y1FSiBbvkjpzzxhg7gz58fqkBh5yU+ophUsaE6d/FYCw87bDyvjOy2nOeeZqplNdg0uBqsHHUBWm3l1UfuGB6oOpzJU41DpigYynC867YpBtclVzwALm+D6Q5UKG+mTRH1piMNNtpYCQoJQNtQA+YHe+FkbB/p/ZSDuP+S1NyGmp9oUxqrSV1F+PTI8ppMg6kK1qKVFCTskDTYAcFV8BqqPSKp2yOUpYfo8BDq2We6BdcZKWSU2UnSd176hawPphjpzPBzW9AlB9qg5jpyVNsOybqhzmVW1MrWndIJAIvuk7i+PaaQprMDmYHMjV1yqPNBrvYTrEmOscakuBaRuLDUQDYcYPHlKjn8kOoxP8A0LKLBmx2fV+ZmJufkzMzhkVCKyH48tezj7N7XVblaFWur7QIPngUj0xym99CeCyph9xqx8gbfUcnGdSMy1WiducCXmSG3SGnWFRBF70OFtpbZKSpQ2KipKb264JKrPanVKS80PndWuw9TfEueka/2ejpEyOgDDkSB5koSoIunqLdODgofmRezHJEaWqKmXUZqkNQ4pNgt1SbgE9EpAKlH09sDzTqVspC9lKA8HrjD7Tc7yat2l5WhUanrqiaU0l1UNJA71x35k79QhIGBwAZGr6HMPUB8aWBzBPO1czDPzdSYeba9KTElFlx9CdSY7DS3Ck6WUEbAA7G6j1ODCuZWlZDkRZuTq9OYbcqTUBIClFuSHCQklpZI2IufS/GO820zLuaKpT5kuPmCNLiOavglUmQXlpvq7tVkEEauoPn543nZTMOoQK5m4Ci06nLL8CmSFJVNmSCkgOrbSToCQTpTfk3JGL2f4jieRiGRnBNj9g/nSZnGiVNdQqmWkTobW6pkR7YpHXTbw/UY9muxa/BjVmmSLpBCJDOqymTbqLbkee18atSzzNr8lLdNid78SoNoY02/V3spSyeAE3vhdzIn/D7tDdhIQtqj1DdIWnwgK6DfhKsSqgcVVET02Yqb+p9OdmVTWurnWm/6Rp7bilf/kZJSfe6VD7uvRm3wmOyN9X6UpLBWH9EaZZVhdKdTZG3l0uD046hzYfhPwElz+zMrNG1JcPkpP54VlZQG5EkDrfDSzT/AGM8f3k/nhY15Npy/X/xiXUe5Rp/Mb2OXx1jvFUmkbjvd/YcV/AnVgP7WGE1Xs2zJGWw4lJguL1utHSnT4r2HiNrdBgzOM3MlL/TeXapS7G8yI6wAPNSCB+ONXuZPlXJFGoMil1GK0y4JW6HwU6FAHceIkq04nq8zKdZUwzS6/Dp1WiN90wpaj3S0/3SjwpO3Q3B3GBLMVGTHRFlyH5lOS+AxMLV/wBW4NvEPcEH2xrUbI1Dp7PxHwf6eS6kXSvu1XHmkXA/G+FEC9xMrF1tAkMj4qDUkRazFajvyhZtuJOD4d/eDaRe3ucaNBl1SgSiqnyHmG0r/qmzdtY9UnbBRQMn0Ftl2XTqauA48kBaClQ0kdLK4+htjPqFRpcSoPQJcuMy7FQl1zUdISkkAEnje469cKd74AjET/YG5uMqt5pczRU2ne6iltppOkWWu9gR+6m9yfPBBTXiqMlV76t74IpOWzmOFIp0MNF5SS2kXBCV22CrcdPzwE0uPPgzFUmoSpVOqzSCt2FJh2SkX30qPzgbeIGx5wh7ypfVT0MFYn29kzdlTO6jrXsCgahgRgU98Zyj5tpqVrS2+oPD9hxIte3VJBHGNSosTKhOFGgTHZ9VdbC0wI8JStY6XUm+i/mTYcnbBzTstLoMFqnSo6A+EAu2OoayLqseu9xf0xiE4V3fs3PWZtnREyMw9oWZ54+HYmOxY6tg3EWWtYPQq5/EYEFwW7PyFxamlYcs7Jbi/EKva/zXP44PmaQhbqY7bjbweJKEakqKt9wB9q2LTPZ2zTHTVWpb+X3Grlb8ZwBK09daVeH6kXw/HkUCec6G5XyhQpQeRPcD1OglIKGnEhMiUq3zLPKUi+yR746rnZxTq/S5EWZUlJWh9bzDzmolsEdVG/lvtba+MTM/Z8K82J1CzPPlzGlf1sqV3iVK6AEAaT64yEPZ7ffjZaqMtju3bNrKdKnVp/fIJOm3N+RggLO5WgnqiI1f5PWS05XrLk5ycJaXqaQHy8C3dTwsEDUdrIw/AtCuFpPsQcL7sogNMLqKm2093FajwELSPCooSVKH0K7W/wBhg92gG4QgH+EYqQ2oJkeQfIgTKzT/AGI97p/PC2ryLzlfT8sMrNBtRX/8v54XNdT/AE07dB+WI9R7lWn8xrY6OO8dHcWxTJZE9JaYIStR1nhCQVKP0G+Ii7NdP6tluOnop46lf6U7ferE7baGgQhITfk9T7nriJ6UEL7ppCnnuqE7BPqo8D8/TGzp8+Z6oKKFnOfSJDMYxqmgz4zimgoG5/WpsokAhfitbrgQT/OjK0lLqn0OUZQ+d1aYyGwPKwH4A4N+3LNCahW2YESTGZlUNKnnZ3cBfcLVazTQV8yrJupRsBsAQb4w6DmuPmGIgTL0+eUai3IIVKeT/eIB+VJ6Hb3OBcEc/X3HobAB7hplSYzVoQfblKWHEW1AqGkkW2K9P3gYp5gbqUxaO6qWXIzMuOkMM1Zrx94CObqGpIPQDnAFKg1DKdQ/S9G7yIhR7xTLX6yXK9FrXfSg+gHoFc4YGX63GrJU+lcan1JCg5KgPNpeZbcPJUOQ6bWJB2+0CRYK2DsdRm4wmyJRJEGdJkSX8tOd8sPLXAQoOKAGlxSje1ysAX8ha+Knb9lVmtZWVVYEpuLV6Qw8ppdrpcZUm7jSvK+kFJ6EeRONYVGupjBbNOhvOnZKGZRS1b37u4HoATgYzBlPMudGFRK9VG4kNXzQaa2pKFDyW4o6lewAHphybRFMWJu+Zs9iOW49AyyZsyQ27Waslp2U4kWShOgBtpJ6gAi5PKiT5Y7zpRJtRmfEwoGXKiYzgcifES1tuJdTdLpNgRdINrDje+M3LeWc2ZMjsQ6TKbqcFpGlMeapTbrSf2UOpvt6KB9COMEhdqc6KhcnLaXH0KXpZfSwooKhZSg5e1lA2J5PUY5wG4nKzA7rgrl/LbNPccW/lXL0FiKCIrzLocVoXvtdG11HgHe+CDMLVPhRFmY/EjNITdZfQEI+p4xBJiU/KsUTKk3ToUaE2VNw4LOyEi51G/zgc6LAJNzc9AaXW6nnyaP/AIdBNy0uwfZmDyWhaboI9LKHlwcJK8UYzcSbmVXs31WpPIhUOgqlxV3Sqe08dAHottRSn67+mNShUijZSiPVV5MkSnilK7qD5WtRACQbJJubYvSU0LJ0VMl1xqkatkPNkqQ6fIEXUfYareWBGTmCbWKk1Mq9MZMNteqG4y4NSvNetN0LJ22IuPTA1Y4HEIcffMf3Zk9TY2TYTrD5X8SpyQ++pKgFPrWSsEndNj4bKsQEjBiFBSQpJBB4IOxwrezSrswa2uK3J/oVbaM1tl1aUlp5OzhAPIULX0k2I3AvfDMMNtCitglhR3Oj5T7p4/74rU2oMicEMRKGaf7Fe90/nhf11P8ASr+gweZoK/0K4FhN9ad08HfANWhd4+wOItR7len8wppGdGarVEQV0ydDS+FmK7ICR3+kXPhBKkbXICuQDwdsEeEcqptVKkR5Hd92qHKbkEpuqQlrvRdbWqxC1Wsm/O4tuBh4rIRYr8Go2Gra5PQX6+mG4chcWRJAZG4Fq8KSUDqrqPb1/LFOsVBqgUSZOS2CIzS3Ut/tqtsPcm2+L+FN/KUq7kDs8VCalBhdRkoYLYVZTzSQVOD2IAH19cOUWZsTlYL0eG7UX30TKrMWqXJlKOtCXFb+G9wogWAPypA2B5wALdVQ5qZkpa3qyVd4kuG/whPC1k/M71CTsnYqBPhDApVUE+jNSwgCQCW0Ap8KVDlYHpwPX2wA5iy6pmagtApD67KWo30km5O/1O+Nwv8AIq3cfkT4giHVBz3PpbEZ+vNfHPSlkRZKbJWsDlxV9td/CBtcgkcY0ptYoM5xBZkOU2XYOrWbsrCiOqjsTb359cL6m5gj1U/BPo1tLs0ywUagloCyQrby3PqSdsbhoMyKsCHIS6zbaNLupIsOEr3I9jfAOig88TVLVa8xi0XM1epmlUOoJfRYf1iA4hXUXA/MdMHFP7XKaWUJqlPnRX9kksNGQ2TxcFO4HuNsfPpWqCbv0mXFIvZbCS4gexbO33DFhFaKYhkorEhmP8S2yVlwp8RbcWblW/2UC3qcYqEdHiC2QHsT6MPajRkCzEeoSVG2lRjltAvflSrcW3wOVXP9Xks6lusQEq5S2oBIB6a1bn32wk15nZdXY1eQ+SnRZC1rJT5eEb4rOPF1QLFNmPgcKkEtIH+o3/6ccyMRR4nK4BsC4xn6xSEyS9VKwy5KjK79tPelxaBsDZIv1I+8+eMrMvaxFosAO0Cmpfacc7l9p+7aGF2uAUjcXGop4IsR03XFWlvwkqbLjESwILMMBOx6FfzfTw4zMvrVUJq6a4g/CTk/DukD+rJN0Oe6V2V7ah1waade25mNlboCoQrrdRqkkVF2aqqU+SrT8PISNCCN+7UgbJWOQtNiRuDyAwYUduFRVvQ79woBbzDwCwj+IfaHkvYjrY85WSMnN05lTMtlZQf1bjalfOQb3HqFXIPv5m8+eKl/NyTFixHSl5ag6l0beD243FwQfUG++FZMgdtiRyoVG5oeZYlk5fg1WO4WFUyopcAXdYKL6XEeZBSpW3Pvh6hpTBuwdTX91fj+E9Pbj2x8/s95B7J3X/hyyZh1d0oeFrWbXF9wm4BHkSN7WOHhlCcmp5Uo01BumRCZc+bVygEi/Xyx2nuiPq4rUDkGeM1OBVFURuCtA/HALVVhclaR+yBg4zeL0nSLXU6gfjhey9QlrCjve2E6j3GafzBCFW6K7BYMkRpbBkAhwm6WyL3cv+6L2P3Y14bFEq0FZijuHu6CwXVKcUydlCyVE2UAE8AFIUBtfCpaplWjVpikIjKqcxTf6qLSHmn2yBba7alGwG91EWtwMbmWJExqpSJFGpdWlOIIE1MRhTyGCSrwrsnUk3B2tfGPpmXzchUkdz6PynmBGZKHFnF6Kt9xsLdQwsHRquUkpuSklNjpJuL26YSn8pWomTV48BAC0U6nqkOW2KXHV6Ui/TwpJ+oPlg17O6HmWJWmaumks0qmTGi3KYkqSl4oTrLZS0EAtqKlaiCrg7i/Ad2uQm6tnevodBWlmDDbIvewspVx5Hf/AHfFQahuMdjG4gRFZIq6kVVUZ7SnvbpB6JsNki/A2weSaX+kY7yEtJe1NkG4uBfYn7icKjM9LXR6iUdy4CCS2bGxHQjzPtgz7Ne0IQ0pp9QdAVyHXlAiw6f/AGT/AOMFnxkj+qRuLIB/zaYU7J06lSy+hSFtE3RpuPYBPU+34YLct5pU3ALcmE6vUe7Q8fF3ivIbkqtySDb88G+iDUQoAIcJ+dCehO9j9OmL7NEhvaXlIBCE92PCNxfj0F/yxM+o3CnEcuLabUweZa+OW0xG0ofcCnFOW1JZbBAJt9o3Nh0JueBv1Jyy27NaGtx2PrS66XHl993iUrSFJULAbLHFgNPBvitKaecrEyEyWW3XGUqaS6DoIQVgjw7+EuIVb0xpCHXGkqW3NYWEpuEBvUpStzbfzvbkee3BbjFCwe5Hndt9fkpzY4pj3cyS5KQtCnGHeFrCba0KA2KwCCCLBQPAIIwM1jOceGy5Gj00la03S/clJSRsQR0PQj6i+2CirCYzKpzEuSy+6XVPp7tOkoQGlJUT7qWkD2xZg0lmSHEHQgoGtKCgWUk346W3P34ByqmyLlOEs6dxSxcoVeuSBIkIcYYd8ReeG5H8PXDTydkOLT46EqQvxgXKvncPp5JwTRqbDYIXoLiudTm9j7Y81zO0XLFPckLbZDwulHi8S1AXCeoBOF5M75fiIxca4+TNSuiDlylO1CaD3+1mkne9thvtc84S0YPZtzK2HmHlFx27S0fNo1bg2NhbZVhtsri+KOYc9z87VNCXQ6lpSgllhu5uT5jqo3+uHT2Udn36Fp6qlMV+tcQCUrQAWyNyAebDr6jDAv8AFbPowN39Dx0JD2j1JFDoVKokd3R4LqRcHwgCwI8ufxFsGH8nbOcer5Xcy464EzqQoltsndcZaipCh56SVIPlYeeEPnfMzmZq/OnoJTEitFDXiCgUja4I8zc4q5Dnz01amy6NNMCqx1DuJCk6kjUBdDiftNq4I6c4bhXYnMVl+RoT7EzULwG/8ZH54AKgm01f8WNak56TnCjuxplPdpdZgPNpmQ3PEkEnZbauFIPQ8+eM+pN3kOn97E2o9RmDzzDehZWoeWG1t0WlRIActrLLdlLtxqUdz9TjTShCCopSlJUdSiBYqPmfM4zMwZlpOV4XxtWlpjtXIT4SpSrAqNkjc2AJPkBiKgZrgZjkSmYTUpIjobc7x5rQl1CyoJUne9jpOygD1tiq7Ml4m0SMIHttltUDPzcx0KLc+lJSo8BJQ4oGw6njnzw/cIT+ULBaquZ6dFdWUp/RbhFlWIJe2P8A0/njiBRuGnoVACsZYg5mh2cIQ7pIae38IPoDvhQ5gyvOy9JS282po2C9aVBXXbcbX2vhg5Xr8jL8wUqtEIif1bLitgFX28RsALb2thgtwoVTS23LYalRlkKAWApJHngFythNHkR7Y1yixwYict52qNDcGhwhlJJsRfWo8k35UdrqNyBxhlUXtjp8hTaZcVTAULFLfiur0F+On/8AMblb7I8vVQamm3YatIADJGm25tY+ZIJN7m1tsZNI7EKTFkXlVGVIHdkAIQGyFHYqvv0vbyxr5dPk5buYqZU4HU9zs05YzBIZ+HlSYssq1MvaNNlDa4IuQdz0sRe4scQSM5Tqc2lb8+nONq+V0x1azsTewUEng+XtgxpnZ3lykvIfYghbrYAQp1RVosOnTrf3xUzN2eUauU34Vtj4V1phTcdTaiEtq02SSOvTCVy4waHUNsRYWRzBaNnfLsGSqXKmPTpbg8Tvd2SLcA/spBPAFhe+++KFR7ZKew0W4MV1t5KUrbW4AtAJ+dJAOxvceR9L3xUl9idYaeSuJUY7qFFF7ghTatICjbqL346fdj1G7CZUlSXpE9uIhbaVdyU61NrPzJJGxA3sfbD60/pjcXeUClFTKd7Xq5VGXoqkxW0rUop0ghSQd06VCxukjY/ffFZinZmzq4XQ25MWVWU+bBPS+524/wB23DKp3ZjlqlqATD+IebFl98olJJHOnj1wTKqtMoDLUic8220laUBtCLhJ5AIHGAOoQGsSwhhY85DKnZh2RxqK78dMX3yuO+KSAPRAPntc9OmNvtTzy1S4H83aM4n4l5IQ4plZBYR5beY8/PrjHq2fa/mApOXY6qXESdnnFAEeekWIt1AIPoRgSby621NdKHFvPp8bz6zYFR3Jtc2PW2Eiy27IeYdAClEHpkFceg1FbSUqCG7LVbclR/IfhjOyg+lquwUKeLNnkWWL+E9OCD9xwbqp36YiSoUVLncs2KzpstVxZVhwbcj253wCZSbH85Uh9nWlk7ja3kbg8jzH1xWjWjXEstMI/M5fpKCIlWpAdFRjkWU25ZL7d7qZWCLKv0uOfLoR0euRM00tuqQ1EpcHjQpOlbSxylQ6EH/ZwLVacFZe+I0B1ccBSCVlNvO5AO3vt7c49UCZFpjUWvxh3MGoOfCVBlY1Fl+10upI4CvtJ+o6489eVoylhRn/2Q==",
    // 輕量眨眼區域貼片 (112x40, 僅 3KB，疊合於 (24, 40) 座標即可產生 100% 無損眨眼幀)
    eye_patch: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAAoAHADASIAAhEBAxEB/8QAHAAAAQUBAQEAAAAAAAAAAAAABgAEBQcIAwEC/8QAORAAAQMCBAQDBgQFBQEAAAAAAQIDBAURAAYSIQcxQVETFGEIImJxgZEVIzKhJEJyseFDUoKywdH/xAAaAQACAwEBAAAAAAAAAAAAAAADBAECBQAG/8QAIBEAAgICAgMBAQAAAAAAAAAAAQIAEQMhBBIxQVEiFP/aAAwDAQACEQMRAD8A0lFYSHmyrf3h/fGXIDqqbJqc59vS47VZLKgf5AhxRV9Soj7Y1tHh2GpfPGS+OkxiLxSr9BpYBYfmR31hKrFEpbSS7pPS/uk+pPrjzqISpmpiyBWuTVLanVYFxpxuFTtR8V1Ispy3PfmTy67f35SqxT2QYFGZSu9x5tzm4f8Abq+wvywPSK0l6lopMBRbgw7If0+74rltxYfp7kcr8tsNWErW5rT7iACEgf39MCIvz4hy1xyGZb7xemuFbrJ/MQkaQEnYg/K/7+mBviDl9T+X6h4MZUuW2kloBWnTY+8QL9ACcGtJdbkoX4Sy64wNKlDfxAP1JuOqQft8sQlebYzVNm5Rp1R8GaW0qkrSL/lggKTfudh9Tg2KwwPyCfYIlbw6KYmUqE8/qkKmPueAptfuNlSVah68rfPHCjxIMlUCIqMoOvzW20EH3bhN0k+gIOCqnOuL4RQS80lT9Fq6Wnkk20pDhB/Zy30x8cJ40Z/M6XX0AMQoz8t1S9w2TZCCO2yVH74cLmiYuFFgQYotInHiPLbqBWCy+VOKbNwF21gHsCOR62ti0E0/ycPzLaQNZKQg8t/1EfS33wLURqoT6hJ4kT5TMSkuOORlNlOnxGgAGz8RB277fPFiyVRDSWX3FJEQI/WFbKvvYdrkc+gScL8liSIXCoAnuVHKKuIlut07QWz7j7Y94npa3r9gMHzD0ylNAw33qnTw0oqfSUheu5uSbgBAA6AW9cVtLQ6uzrK0AdAnlbmAB++JjKuY3KS8Wpi/4B9X5ySCS3fYkdh3A7DCZJ9RgV7kwmosvFUh+SQzqFyok7kj/wCj/ODngEl5eec0eOm3lY7LDCb30oLrir37qI1H6DoMU7xKjvs11qHEcQzT5rnjMAP/AOntdR9Lkm/r3xoPgVCQ9AqWaUNeEzVVtMxEnmqPHSW0rI6Fa/EVbtp64Y46nt2lOXkvHUM61UYdHo82q1BzwocOOuQ+u17IQkqV9bDGHcyvy6lWZ2aHEeWqdYlKdSlR1eXQ4q4QB1UE6QT3HYY1D7Tk5UPhLMZQ+ppU2VHilKEAlxKnAVI3OwISbnfYHvfGY/OQ5FbcmyHkphwFL1OKPuXA3N+p6f5wV2IGothAJudIbTbL7UDSlXgIBWnbnt2xM1+nVd2lechrDLJuCUpF7dCO+AWFnB6qV19zLmWpc1IXcvFYaHzJIIH1OLkn1uRSKLHqlaydNcppaSp+VTnQ+uMbblxsWun4gCLdsBbG6sNRpWUg7lf+z1EcEjMFMeKjKZcDgQCChQBtcdQRyt1BHbEb7PMRyZnjM1cfUoKSSixH8y1lX7BNsXNkOZkWqyPxTKlTpkuS63oV4bgS+lPZSFWUO3LEdLyS/lM1+t0kuEVCSJTkdaB+XsdWm3S5v6Ys+UjsCKJlEQGt+JUOc6bOEvPdEp7Skx35bM1pXQrtr0D5kgnsBiBpK6xS8nZnqJjLIqEVuM2E7aLOrQo/b/tix2XFVRgSJDagH1atClcj88OREBRoWBp31Ite47W6jFhyKFESDi3YjLilQ2oPAGNBbGkwG4qiE9V3AV+6zj1kphezDGqclxLkjwbM6typeshA35gduR03wRVCh1bPWQJdJjgRG31oQp5zfTpWFG3flg7TlmkJy9TKM5HjuQqe2hLJeVsNCbBR6X2vfuTga5vyAftyzYwDr5KW4W/jy6bHVMaDgKQpa3jYp+FKbc+RN8EU6OvzgQuPp8ZNrm1yfX1wYxKjk6HVvwynVAVqooBWqNSGVSlNeq1I91HzUoYrzOfEKjQ82+Xq8Sr0/wAA2/iYZBWO4sbH574o6O7WBJVlC0TGUmF+J1FNMljykuKUqivn8xKmgf0HrsenKx2xqX2f/FjZKdo8lOh+DMcum9xocs6gp+EhZt8j64zhUZ7cxESqUt9EiK7YKUgp2B5E33uNrjY4vDgrU3V1mEp4LPnaT4K1AbamXCUk/wDFShv6W64Jgchupg+QtpYnz7WYUOEoeQW0lqrQ1aluaAm6ym9/r1xjPMcp+YtrK9FKHnZz+p5bK9QVvyvyttc9rYWFhxAKv5FlOofpovlWafTqJPSyy2yQGlKB8wsbqWk9Tc7+lsPsv59zflyWIociqig2VFmq3G/NK0m4+n2wsLCg/R3GzrxJ92DwqzrKSqr5cRSqs+QBJjL8LUo9Q43YX/qTfHXI78vh5xPXkeqVqdU8vVWIuRTlz3vEXHdQLqb1HmCkHblfT1vdYWIV2NoTqjLBRQb3I4+C2tSGhdsLUUpHS6rgf+YcJcbUhJcNlHkLcvTCwsZxyNc0/wCdKk3n/Mkxqn5b4e5Ilswq1W2Q4uYd/JxgCVLHxqOoDrsbb4H6vwx4fZdZZXxBzzmauSHQFGIZSylZ/oQCq3qVDCwsaKuyBFU1YmW6gsbjmHxJoVDpYo2QsjLpsELtqd0M6/jIuVKPqo4YCZU82TPISYSZ9PcUUzXnCAhsW5I23V8uWFhY7IKPb3IU6qV5T0zMg5/k5amur/DJO8dbibAhW6Cf3STjTPAZ+WK5Soy5DT7QZmGyLXSmzZTfltckdenzwsLBSAXRvZgb/DLP/9k="
};

if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = (typeof firebase !== 'undefined' && typeof firebase.database === 'function') ? firebase.database() : null;

let cart = [];
try {
    cart = JSON.parse(localStorage.getItem('CatGazeCart')) || [];
} catch (e) {
    cart = [];
}

// 預設商品庫備援
const DEFAULT_CATALOG_FALLBACK = {
    'CG-LH001': {
        id: 'CG-LH001', status: '既有基準', title: '小葉羅漢松 | 寵物友善長壽守護', price: 2200, image: 'luohan.jpg',
        badge: '100% 寵物無毒', categories: ['pet-friendly', 'products-deciduous', 'index'], subCategoryLabel: '陽台喜光',
        template: 'pet', url: 'luohan-detail.html',
        petDetails: { light: '半日照 / 通風', water: '每週 2-3 次', safe: '100% 寵物無害', qiaoyu: '「這棵樹的葉子尖尖的，但我咬過之後發現一點也不好吃（而且沒毒），本店長批准它進駐客廳！」' }
    },
    'CG-FN001': {
        id: 'CG-FN001', status: '既有基準', title: '銀脈鳳尾蕨 | 室內耐陰保濕首選', price: 980, image: 'fern.jpg',
        badge: '100% 寵物無毒', categories: ['pet-friendly', 'products-deciduous', 'index'], subCategoryLabel: '耐陰室內',
        template: 'pet', url: 'fern-detail.html',
        petDetails: { light: '室內散射光 / 耐陰', water: '保持盆土微濕', safe: '100% 寵物無害', qiaoyu: '「冷氣房太乾了？這盆銀白色的蕨類能幫你的空間保濕，而且就算本喵不小心撥到葉子也完全安全無毒喵！」' }
    },
    'CG-XD001': {
        id: 'CG-XD001', status: '上架', title: '小豆樹 | 療癒羽葉微景觀', price: 1200, image: 'xiaodou.jpg',
        badge: '療癒新品', categories: ['pet-friendly', 'products-deciduous', 'index', 'new-arrivals'], subCategoryLabel: '耐陰室內',
        template: 'pet', url: 'product.html?id=CG-XD001',
        petDetails: { light: '明亮散射光 / 半日照', water: '表土微乾即澆透', safe: '含盆高約 20-25 公分', qiaoyu: '「這棵小豆樹跟本喵一樣作息超規律！太陽下山它的葉子就會合起來睡覺，放在書桌旁陪你工作超療癒喵～」' }
    },
    'CG-SB002': {
        id: 'CG-SB002', status: '既有基準', title: '系魚川真柏 | 職人手作雲朵造型', price: 4500, image: 'shimpaku_main.jpg',
        badge: '一物一拍', categories: ['products-deciduous', 'index', 'new-arrivals'], subCategoryLabel: '桌面山林',
        template: 'bonsai', url: 'shimpaku.html',
        tagline: '✦ 貓凝嚴選：葉質細緻，雲朵造型、樹性強健、極耐修剪',
        files: { species: '系魚川真柏', age: '約 8 年', size: '含盆高約 22 公分', pot: '復古朱泥圓盆' }
    },
    'CG-BP001': {
        id: 'CG-BP001', status: '既有基準', title: '黑松 | 扭幹文人風', price: 1800, image: 'black_pine.jpg',
        badge: '職人雕塑', categories: ['products-deciduous', 'index', 'new-arrivals'], subCategoryLabel: '桌面山林',
        template: 'bonsai', url: 'black-pine.html',
        tagline: '✦ 貓眼嚴選：蒼勁扭幹文人風，樹皮老態鱗片縱裂，居家窗台首選',
        files: { species: '日本黑松', age: '約 8 年', size: '含盆高約 25 公分', pot: '復古紫砂圓盆' }
    },
    'CG-RM003': {
        id: 'CG-RM003', status: '既有基準', title: '日本紅楓 | 季節色彩首選', price: 1200, image: 'red-maple.jpg',
        badge: '季節限定', categories: ['products-deciduous', 'index', 'new-arrivals'], subCategoryLabel: '桌面山林',
        template: 'bonsai', url: 'red-maple.html',
        tagline: '✦ 貓眼嚴選：春季新芽火紅，適合居家陽台點綴',
        files: { species: '日本紅楓', age: '約 2 年', size: '含盆高約 32 公分', pot: '造型陶盆' }
    },
    'CG-TL001': {
        id: 'CG-TL001', status: '上架', title: '日本製 職人級黑鋼剪定鋏', price: 1880, image: 'tool-1.jpg',
        badge: '修剪工具', categories: ['tools'], subCategoryLabel: '修剪工具',
        template: 'tool', url: 'product.html?id=CG-TL001',
        tagline: '✦ 日本鍛造高碳黑鋼，刀口俐落不傷維管束，切口平整癒合快。'
    },
    'CG-TL002': {
        id: 'CG-TL002', status: '上架', title: '三本線 赤玉土 (極硬質 - 5L)', price: 450, image: 'tool-2.jpg',
        badge: '專業介質', categories: ['tools'], subCategoryLabel: '專業介質',
        template: 'tool', url: 'product.html?id=CG-TL002',
        tagline: '✦ 日本進口三本線極硬質赤玉土，排水透氣極佳、不易崩解粉化，徹底預防爛根。'
    },
    'CG-TL003': {
        id: 'CG-TL003', status: '上架', title: '墨染手作 柴燒粗陶盆', price: 1200, image: 'tool-3.jpg',
        badge: '職人盆器', categories: ['tools'], subCategoryLabel: '職人盆器',
        template: 'tool', url: 'product.html?id=CG-TL003',
        tagline: '✦ 高溫柴燒自然落灰肌理，富含透氣微孔隙，讓植物根系自由呼吸。'
    },
    'CG-TL004': {
        id: 'CG-TL004', status: '上架', title: '日本好康多 1號 長效緩釋基肥 (350g)', price: 185,
        image: 'https://pcm4.trplus.com.tw/1000x1000/sys-master/productImages/hff/hd3/10412624707614/000000000016105288-gallery-01-20211028115401401.jpg',
        badge: '養護資材', categories: ['tools'], subCategoryLabel: '養護資材',
        template: 'tool', url: 'product.html?id=CG-TL004',
        tagline: '✦ 日本樹脂裹覆緩釋技術，肥效長達 90 天，完全無臭無味不引蚊蠅小黑飛。'
    },
    'CG-TL005': {
        id: 'CG-TL005', status: '上架', title: '植萃苦楝油＋茶皂素 免稀釋防護噴霧 (500ml)', price: 280,
        image: 'https://www.fwusow.com.tw/images/products/%E8%82%A5%E6%96%99%E8%B3%87%E6%9D%90/%E5%BE%A1%E8%8A%B1%E5%9C%92%E7%B3%BB%E5%88%97/4-5_%E5%BE%A1%E8%8A%B1%E5%9C%92%E9%99%A4%E8%9F%B2%E5%8A%91-%E5%85%A8%E8%88%AC500ml.png',
        badge: '養護資材', categories: ['tools'], subCategoryLabel: '養護資材',
        template: 'tool', url: 'product.html?id=CG-TL005',
        tagline: '✦ 天然冷壓苦楝油結合茶皂素，免稀釋防範介殼蟲與小黑飛，對貓狗毛孩環境溫和安全。'
    },
    'CG-TL006': {
        id: 'CG-TL006', status: '上架', title: '日式極細長嘴 不鏽鋼烤漆澆水壺 (1.2L)', price: 580,
        image: 'https://img.pchome.com.tw/cs/items/DQBR12A900KI0BV/000001_1790400903.jpg',
        badge: '養護資材', categories: ['tools'], subCategoryLabel: '養護資材',
        template: 'tool', url: 'product.html?id=CG-TL006',
        tagline: '✦ 極細長彎嘴直達盆土根部，水流平穩不沖散赤玉土，室內案頭澆灌美學神器。'
    }
};

window.__CATGAZE_SHEET_PRODUCTS__ = Object.assign({}, DEFAULT_CATALOG_FALLBACK);

function getUserKey() {
    try {
        const profile = JSON.parse(localStorage.getItem('CatGazeProfile'));
        return profile && profile.email ? profile.email.replace(/\./g, '_') : null;
    } catch (e) {
        return null;
    }
}

function syncCartData() {
    localStorage.setItem('CatGazeCart', JSON.stringify(cart));
    const userKey = getUserKey();
    if (userKey && database) {
        database.ref('carts/' + userKey).set(cart);
    }
    updateCount();
    renderCart();
}

function toggleCart() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    if (!drawer || !overlay) return;
    if (drawer.style.right === '0px') {
        drawer.style.right = '-400px';
        overlay.style.display = 'none';
    } else {
        drawer.style.right = '0px';
        overlay.style.display = 'block';
        renderCart();
    }
}

function addToCart(pName, pPrice, pImage) {
    const item = {
        name: pName,
        price: Number(pPrice) || 0,
        image: pImage || 'CG_logo w bg_vertica_green.png'
    };
    cart.push(item);
    syncCartData();

    const drawer = document.getElementById('cart-drawer');
    if (drawer && drawer.style.right !== '0px') {
        toggleCart();
    }
}

function addToFavorites(pName, pPrice, pImage) {
    if (typeof firebase === 'undefined' || !firebase.auth) {
        alert("請先登入會員才能收藏植物喔！");
        window.location.href = "member.html";
        return;
    }
    const user = firebase.auth().currentUser;
    if (!user) {
        alert("請先登入會員才能收藏植物喔！");
        window.location.href = "member.html";
        return;
    }

    const favData = {
        name: pName,
        price: Number(pPrice) || 0,
        image: pImage || 'CG_logo w bg_vertica_green.png',
        addedAt: firebase.database.ServerValue.TIMESTAMP
    };

    const favKey = pName.replace(/[.#$\[\]\s]/g, '_');
    firebase.database().ref('favorites/' + user.uid + '/' + favKey).set(favData)
        .then(() => alert("✨ 已加入收藏清單"))
        .catch(() => alert("收藏失敗，請稍後再試"));
}

function updateCount() {
    const countElements = document.querySelectorAll('#cart-count');
    countElements.forEach(el => {
        el.innerText = cart.length;
    });
}

function updateCartUI() {
    updateCount();
    renderCart();
}

function renderCart() {
    const list = document.getElementById('cart-items-content');
    const total = document.getElementById('cart-total-price');
    if (!list || !total) return;

    if (cart.length === 0) {
        list.innerHTML = '<p style="text-align:center; color:#999;">目前沒有選購植物</p>';
        total.innerText = 'NT$ 0';
        return;
    }

    let html = '';
    let sum = 0;
    cart.forEach((item, index) => {
        const p = Number(item.price) || 0;
        sum += p;
        html += `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid #f9f9f9; padding-bottom:10px;">
                <div>
                    <div style="font-weight:bold;">${item.name}</div>
                    <div style="color:#d14900; font-size:0.9rem;">NT$ ${p.toLocaleString()}</div>
                </div>
                <button onclick="removeItem(${index})" style="color:#ccc; background:none; border:none; cursor:pointer; font-size:0.9rem;">移除</button>
            </div>`;
    });
    list.innerHTML = html;
    total.innerText = `NT$ ${sum.toLocaleString()}`;
}

function removeItem(index) {
    cart.splice(index, 1);
    syncCartData();
}

function checkoutToLine() {
    if (cart.length === 0) return alert("購物車是空的喔！");
    const userKey = getUserKey();
    let profile = null;
    try {
        profile = JSON.parse(localStorage.getItem('CatGazeProfile'));
    } catch (e) {}

    if (!userKey || !profile) {
        alert("下單前請先至【👤 會員】填寫聯繫資料！");
        window.location.href = "member.html";
        return;
    }

    const currentUser = (typeof firebase !== 'undefined' && firebase.auth) ? firebase.auth().currentUser : null;
    const uid = (currentUser && currentUser.uid) || profile.uid || userKey;
    const totalSum = cart.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
    const nowStr = new Date().toLocaleString('zh-TW');
    const orderId = "ORD-" + Date.now();

    const orderData = {
        order_id: orderId,
        uid: uid,
        customer: profile,
        items: cart,
        total_price: totalSum,
        totalPrice: totalSum,
        status: "待處理",
        created_at: nowStr,
        orderDate: nowStr
    };

    if (!database) {
        alert("雲端資料庫連線異常，請重新整理頁面。");
        return;
    }

    const itemLines = cart.map((item, idx) => `${idx + 1}. ${item.name} (NT$ ${(Number(item.price) || 0).toLocaleString()})`).join('\n');
    const lineOrderMsg = `【Cat Gaze 貓凝植栽｜官網選植結帳單】\n📦 訂單編號：${orderId}\n👤 訂購人：${profile.name || '官網會員'}（${profile.phone || ''}）\n🪴 選購品項：\n${itemLines}\n💰 總計金額：NT$ ${totalSum.toLocaleString()}\n\n巧遇店長你好！我已在官網送出訂單，請協助確認植株與匯款資訊，謝謝🐾`;

    database.ref('orders/' + orderId).set(orderData)
        .then(() => database.ref('carts/' + userKey).remove())
        .then(() => {
            cart = [];
            localStorage.setItem('CatGazeCart', JSON.stringify(cart));
            updateCount();
            toggleCart();
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(lineOrderMsg).catch(() => {});
            }
            const targetLineUrl = CATGAZE_LINE_OA_MSG_URL + encodeURIComponent(lineOrderMsg);
            alert("✨ 訂單已成立（編號：" + orderId + "）！\n系統已為您複製訂單明細，即將為您開啟【Cat Gaze LINE 官方帳號 (@201zilzp)】完成結帳確認🐾");
            window.open(targetLineUrl, '_blank');
        })
        .catch(() => alert("傳送失敗，請檢查網路"));
}

// ==========================================================================
// 雲端商品同步與子分類篩選引擎
// ==========================================================================
function getCurrentPageKey() {
    let path = window.location.pathname.split('/').pop() || 'index.html';
    if (!path.endsWith('.html')) path = 'index.html';
    return path.replace('.html', '');
}

const LEGACY_PAGE_ID_MAP = {
    'shimpaku': 'CG-SB002',
    'black-pine': 'CG-BP001',
    'red-maple': 'CG-RM003',
    'luohan-detail': 'CG-LH001',
    'fern-detail': 'CG-FN001'
};

function syncLegacyDetailPageFromSheet(sheetMap) {
    const pageKey = getCurrentPageKey();
    const mappedId = LEGACY_PAGE_ID_MAP[pageKey];
    if (!mappedId || !sheetMap[mappedId]) return;
    const p = sheetMap[mappedId];
    const priceNum = Number(p.price) || 0;

    const titleEl = document.getElementById('display-title');
    if (titleEl) {
        titleEl.innerText = p.title;
        document.title = p.title + " - Cat Gaze";
        const priceEl = document.getElementById('display-price');
        if (priceEl) priceEl.innerText = "NT$ " + priceNum.toLocaleString();
        const imgEl = document.getElementById('display-img');
        if (imgEl && p.image) imgEl.src = p.image;
        const tagEl = document.getElementById('display-tagline');
        if (tagEl && p.tagline) tagEl.innerText = p.tagline;
        if (p.files) {
            const sp = document.getElementById('file-species');
            const ag = document.getElementById('file-age');
            const sz = document.getElementById('file-size');
            const pt = document.getElementById('file-pot');
            if (sp) sp.innerText = p.files.species;
            if (ag) ag.innerText = p.files.age;
            if (sz) sz.innerText = p.files.size;
            if (pt) pt.innerText = p.files.pot;
        }
        const addBtn = document.getElementById('add-btn');
        if (addBtn) {
            if (p.status === '下架') {
                addBtn.innerText = "目前已下架 / 售罄";
                addBtn.disabled = true;
                addBtn.style.background = "#ccc";
                addBtn.onclick = null;
            } else {
                addBtn.onclick = function() { addToCart(p.title, priceNum, p.image); };
            }
        }
    }

    const petTitleEl = document.querySelector('.product-info-section .product-title');
    if (petTitleEl) {
        petTitleEl.innerText = p.title;
        document.title = p.title + " | Cat Gaze";
        const petPriceEl = document.querySelector('.product-info-section .price-tag');
        if (petPriceEl) petPriceEl.innerText = "NT$ " + priceNum.toLocaleString();
        const petImgEl = document.querySelector('.product-image-section img');
        if (petImgEl && p.image) petImgEl.src = p.image;
        const petDescEl = document.querySelector('.product-info-section > p');
        if (petDescEl && p.petDetails && p.petDetails.desc) petDescEl.innerText = p.petDetails.desc;
        const qiaoyuEl = document.querySelector('.qiaoyu-text');
        if (qiaoyuEl && p.petDetails && p.petDetails.qiaoyu) qiaoyuEl.innerText = p.petDetails.qiaoyu;
        const careStrongEls = document.querySelectorAll('.care-tags .care-tag strong');
        if (careStrongEls.length >= 3 && p.petDetails) {
            careStrongEls[0].innerText = p.petDetails.light;
            careStrongEls[1].innerText = p.petDetails.water;
            careStrongEls[2].innerText = p.petDetails.safe;
        }
        const buyBtn = document.querySelector('.buy-actions .btn-main');
        if (buyBtn) {
            if (p.status === '下架') {
                buyBtn.innerText = "目前已下架 / 售罄";
                buyBtn.disabled = true;
                buyBtn.style.background = "#ccc";
                buyBtn.onclick = null;
            } else {
                buyBtn.onclick = function() { addToCart(p.title, priceNum, p.image); };
            }
        }
    }
}

function findMatchingStaticCard(p) {
    const shortName = (p.title || '').split('|')[0].trim();
    if (!shortName) return null;
    const allCards = document.querySelectorAll('.product-card, .bonsai-card, .feature-item');
    for (let i = 0; i < allCards.length; i++) {
        const card = allCards[i];
        if (card.id && card.id.startsWith('cloud-prod-')) continue;
        if (card.closest('.categories-section')) continue;
        const heading = card.querySelector('.product-title, .card-title, h3, h2');
        const headingText = heading ? heading.innerText.trim() : card.innerText;
        if (headingText && (headingText.includes(shortName) || shortName.includes(headingText))) {
            return card;
        }
    }
    return null;
}

function enhanceExistingStaticCard(card, p) {
    const detailUrl = p.url || `product.html?id=${encodeURIComponent(p.id)}`;
    const priceNum = Number(p.price) || 0;

    const heading = card.querySelector('.product-title, .card-title, h3');
    if (heading && p.title) heading.innerText = p.title;

    const priceEl = card.querySelector('.product-price, .price, .price-tag');
    if (priceEl && priceNum > 0) {
        priceEl.innerText = 'NT$ ' + priceNum.toLocaleString();
    }

    if (p.subCategoryLabel) {
        if (card.hasAttribute('data-category')) {
            card.setAttribute('data-category', p.subCategoryLabel);
        }
        if (card.hasAttribute('data-type')) {
            card.setAttribute('data-type', p.subCategoryLabel.includes('多肉') ? 'succulent' : 'caudex');
        }
        const tagEl = card.querySelector('.product-tag');
        if (tagEl && !tagEl.getAttribute('href')) {
            tagEl.innerText = p.subCategoryLabel;
        }
    }

    const cartBtn = card.querySelector('.add-to-cart-btn, .btn-add, .btn-cta, .btn-luxury');
    if (cartBtn && cartBtn.tagName === 'BUTTON') {
        cartBtn.onclick = function(e) {
            if (e) e.stopPropagation();
            addToCart(p.title, priceNum, p.image);
        };
    }

    const existingLink = card.querySelector('a[href]');
    if (!existingLink && !card.getAttribute('onclick')) {
        const imgBox = card.querySelector('.product-image, .img-box, .img-container, .feature-img');
        const infoBox = card.querySelector('.product-info');
        if (imgBox) {
            imgBox.style.cursor = 'pointer';
            imgBox.onclick = function() { window.location.href = detailUrl; };
        }
        if (infoBox) {
            infoBox.style.cursor = 'pointer';
            infoBox.onclick = function() { window.location.href = detailUrl; };
        }
    }
}

function getTargetProductGrid(pageKey) {
    if (pageKey === 'index') {
        return document.querySelector('#home-featured-grid, .featured .product-grid, #shop .product-grid');
    }
    if (pageKey === 'new-arrivals') {
        return document.querySelector('.Bonsai-grid, .featured-new');
    }
    return document.querySelector('#product-container, #productGrid, .product-grid');
}

function insertProductCardOnPage(p, pageKey) {
    if (!p || !p.id) return;
    if (document.getElementById('cloud-prod-' + p.id)) return;

    const existingStatic = findMatchingStaticCard(p);
    if (existingStatic) {
        enhanceExistingStaticCard(existingStatic, p);
        return;
    }

    const grid = getTargetProductGrid(pageKey);
    if (!grid) return;

    const priceNum = Number(p.price) || 0;
    const safeTitle = (p.title || '').replace(/'/g, "\\'");
    const safeImg = (p.image || '').replace(/'/g, "\\'");
    const detailUrl = p.url || `product.html?id=${encodeURIComponent(p.id)}`;
    const subCat = p.subCategoryLabel || p.badge || '';
    let cardHtml = '';

    if (pageKey === 'new-arrivals') {
        if (grid.classList.contains('featured-new')) {
            cardHtml = `
            <div class="feature-item" id="cloud-prod-${p.id}">
                <div class="feature-img" onclick="location.href='${detailUrl}'" style="cursor:pointer;">
                    <img src="${p.image}" alt="${p.title}" onerror="this.src='CG_logo w bg_vertica_green.png'">
                </div>
                <div class="feature-text">
                    <h2 onclick="location.href='${detailUrl}'" style="cursor:pointer;">${p.title}</h2>
                    <p>${(p.petDetails && p.petDetails.desc) || p.tagline || 'Cat Gaze 嚴選植栽'}</p>
                    <span class="price-tag">NT$ ${priceNum.toLocaleString()}</span>
                    <button class="btn-luxury" onclick="addToCart('${safeTitle}', ${priceNum}, '${safeImg}')">將這份靜謐帶回家</button>
                    <a href="${detailUrl}" style="margin-left:15px; color:#7F916A; text-decoration:none; font-weight:bold;">查看詳情 →</a>
                </div>
            </div>`;
        } else {
            cardHtml = `
            <div class="bonsai-card" id="cloud-prod-${p.id}">
                <div class="img-container">
                    <span class="unique-tag">${p.badge || '一物一拍'}</span>
                    <img src="${p.image}" alt="${p.title}" onerror="this.src='CG_logo w bg_vertica_green.png'">
                </div>
                <div class="card-info">
                    <span class="card-meta">${(p.files && p.files.species) || '嚴選新作'} | ${(p.files && p.files.size) || '職人精選'}</span>
                    <h3 class="card-title serif">${p.title}</h3>
                    <div class="card-footer">
                        <span class="price">NT$ ${priceNum.toLocaleString()}</span>
                        <a href="${detailUrl}" class="btn-view">凝視細節 →</a>
                    </div>
                </div>
            </div>`;
        }
    } else if (pageKey === 'pet-friendly') {
        const petSubCat = subCat.includes('陽台喜光') ? '陽台喜光' : (subCat.includes('耐陰室內') ? '耐陰室內' : '耐陰室內 陽台喜光');
        const envIcon = petSubCat === '陽台喜光' ? '☀️ 半日照' : '☁️ 耐陰';
        cardHtml = `
        <div class="product-card" id="cloud-prod-${p.id}" data-category="${petSubCat}" onclick="location.href='${detailUrl}'" style="cursor:pointer;">
            <div class="pet-badge">${p.badge || 'CAT SAFE'}</div>
            <button class="btn-fav-float" onclick="event.stopPropagation(); addToFavorites('${safeTitle}', ${priceNum}, '${safeImg}')">
                <svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            </button>
            <div class="img-box">
                <img src="${p.image}" alt="${p.title}" onerror="this.src='CG_logo w bg_vertica_green.png'">
                <div class="env-bar">
                    <span>${envIcon}</span>
                    <span>💧 ${(p.petDetails && p.petDetails.water) || '土乾澆透'}</span>
                    <span>🐾 100%無毒</span>
                </div>
            </div>
            <div class="product-info">
                <h3>${p.title}</h3>
                <p class="product-desc">${(p.petDetails && p.petDetails.desc) ? p.petDetails.desc.substring(0, 42) + '...' : '經 ASPCA 認證對貓狗無毒的安全療癒植栽。'}</p>
                <div class="price-row">
                    <span class="price">NT$ ${priceNum.toLocaleString()}</span>
                    <button class="btn-add" onclick="event.stopPropagation(); addToCart('${safeTitle}', ${priceNum}, '${safeImg}')">+</button>
                </div>
            </div>
        </div>`;
    } else if (pageKey === 'products-deciduous') {
        const qiaoyu = (p.petDetails && p.petDetails.qiaoyu) || p.tagline || '「本喵親自認證的療癒綠意喵～」';
        cardHtml = `
        <div class="product-card" id="cloud-prod-${p.id}" onclick="location.href='${detailUrl}'" style="cursor:pointer;">
            <div class="img-box">
                <div class="status-badge">${p.badge || 'OFFICE HEALING'}</div>
                <img src="${p.image}" alt="${p.title}" onerror="this.src='CG_logo w bg_vertica_green.png'">
            </div>
            <div class="product-info">
                <h3 class="serif">${p.title}</h3>
                <div class="healing-meta">
                    光照：${(p.petDetails && p.petDetails.light) || '明亮散射光'}<br>
                    澆水：${(p.petDetails && p.petDetails.water) || '表土微乾澆透'}
                </div>
                <div class="qiaoyu-bubble">${qiaoyu}</div>
                <div class="price-row">
                    <span class="price">NT$ ${priceNum.toLocaleString()}</span>
                    <button class="btn-add" onclick="event.stopPropagation(); addToCart('${safeTitle}', ${priceNum}, '${safeImg}')">帶回家</button>
                </div>
            </div>
        </div>`;
    } else if (pageKey === 'products-mini') {
        const miniCat = subCat || '桌面盆栽';
        cardHtml = `
        <div class="product-card reveal active" id="cloud-prod-${p.id}" data-category="${miniCat}">
            <div class="img-container" onclick="location.href='${detailUrl}'" style="cursor:pointer;">
                <div class="env-label">${p.badge || '☀️ 嚴選'}</div>
                <div class="img-box"><img src="${p.image}" alt="${p.title}" onerror="this.src='CG_logo w bg_vertica_green.png'"></div>
            </div>
            <div class="product-info">
                <h3 onclick="location.href='${detailUrl}'" style="cursor:pointer;">${p.title}</h3>
                <p class="product-desc">${(p.petDetails && p.petDetails.desc) || p.tagline || 'Cat Gaze 嚴選植栽'}</p>
                <div class="price-row">
                    <span class="price">NT$ ${priceNum.toLocaleString()}</span>
                    <button class="btn-add" onclick="addToCart('${safeTitle}', ${priceNum}, '${safeImg}')">加入選植清單</button>
                </div>
            </div>
        </div>`;
    } else if (pageKey === 'products-caudex') {
        const caudexType = subCat.includes('多肉') ? 'succulent' : 'caudex';
        const badgeLabel = caudexType === 'succulent' ? 'SUCCULENT' : 'CAUDEX';
        cardHtml = `
        <div class="product-card" id="cloud-prod-${p.id}" data-type="${caudexType}">
            <div class="badge ${caudexType}">${badgeLabel}</div>
            <div class="img-box" onclick="location.href='${detailUrl}'" style="cursor:pointer;">
                <img src="${p.image}" alt="${p.title}" onerror="this.src='CG_logo w bg_vertica_green.png'">
            </div>
            <div class="product-info">
                <h3 onclick="location.href='${detailUrl}'" style="cursor:pointer;">${p.title}</h3>
                <span class="sci-name">${(p.files && p.files.species) || 'Cat Gaze Selection'}</span>
                <div class="price-row">
                    <span class="price">NT$ ${priceNum.toLocaleString()}</span>
                    <button class="btn-add" onclick="addToCart('${safeTitle}', ${priceNum}, '${safeImg}')">加入購物車</button>
                </div>
            </div>
        </div>`;
    } else if (pageKey === 'tools') {
        const toolTag = subCat || p.badge || '職人選物';
        cardHtml = `
        <div class="product-card" id="cloud-prod-${p.id}">
            <div onclick="location.href='${detailUrl}'" style="cursor:pointer;">
                <div class="product-image"><img src="${p.image}" alt="${p.title}" onerror="this.src='CG_logo w bg_vertica_green.png'"></div>
                <div class="product-info">
                    <div class="product-tag">${toolTag}</div>
                    <h3 class="product-title">${p.title}</h3>
                    <div class="product-price">NT$ ${priceNum.toLocaleString()}</div>
                </div>
            </div>
            <button class="add-to-cart-btn" onclick="addToCart('${safeTitle}', ${priceNum}, '${safeImg}')">加入選植清單</button>
        </div>`;
    } else if (pageKey === 'index') {
        const subtitleStr = (p.files && p.files.size && p.files.size !== '--') ? p.files.size : (p.badge || '嚴選新作');
        cardHtml = `
        <div class="product-card" id="cloud-prod-${p.id}" onclick="location.href='${detailUrl}'" style="cursor:pointer;">
            <div class="product-image-placeholder">
                <img src="${p.image}" alt="${p.title}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='CG_logo w bg_vertica_green.png'">
            </div>
            <div class="product-info">
                <div class="product-title">${p.title}</div>
                <div class="product-subtitle">${subtitleStr}</div>
                <div class="product-price">NT$ ${priceNum.toLocaleString()}</div>
                <a href="${detailUrl}" class="product-tag">#查看詳情</a>
            </div>
        </div>`;
    }

    if (cardHtml) {
        grid.insertAdjacentHTML('beforeend', cardHtml);
    }
}

function bindDynamicCategoryFilters() {
    const pageKey = getCurrentPageKey();

    if (pageKey === 'pet-friendly') {
        const btns = document.querySelectorAll('.filter-tag');
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                const selected = btn.textContent.trim();
                document.querySelectorAll('.product-card').forEach(card => {
                    const cats = card.getAttribute('data-category') || '';
                    if (selected === '全部植物' || cats.includes(selected)) {
                        card.classList.remove('hidden');
                        card.style.display = '';
                    } else {
                        card.classList.add('hidden');
                    }
                });
            });
        });
    } else if (pageKey === 'products-mini') {
        const btns = document.querySelectorAll('.filter-btn');
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filterVal = btn.getAttribute('data-filter') || 'all';
                document.querySelectorAll('.product-card').forEach(card => {
                    const cats = card.getAttribute('data-category') || '';
                    if (filterVal === 'all' || cats.includes(filterVal)) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    } else if (pageKey === 'tools') {
        const btns = document.querySelectorAll('.filter-btn');
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                const selectedTag = btn.textContent.trim();
                document.querySelectorAll('.product-card').forEach(card => {
                    const tagEl = card.querySelector('.product-tag');
                    const cardTag = tagEl ? tagEl.textContent.trim() : '';
                    if (selectedTag === '全部' || cardTag.includes(selectedTag)) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }
}

function parseSheetRowToProduct(cells) {
    const val = (idx) => (cells[idx] && cells[idx].v !== null && cells[idx].v !== undefined) ? String(cells[idx].v).trim() : '';
    const id = val(0);
    const status = val(1);
    const title = val(2);
    const priceRaw = cells[3] && cells[3].v !== null ? Number(String(cells[3].v).replace(/[^0-9.]/g, '')) : 0;
    const image = val(4) || 'CG_logo w bg_vertica_green.png';
    const badge = val(5) || '嚴選上架';

    const colG = val(6);
    const colH = val(7);
    const colI = val(8);
    const colJ = val(9);
    const isNew15Col = colJ.includes('bonsai') || colJ.includes('pet') || colJ.includes('tool') || colG.includes('(') || colH.includes('｜');

    let categories = [];
    let subCategoryLabel = '';
    let template = 'bonsai';
    let descOrTagline = '';
    let spec1 = '', spec2 = '', spec3 = '', spec4 = '';

    if (isNew15Col) {
        if (colG.includes('pet-friendly') || colG.includes('寵物友善')) categories.push('pet-friendly');
        if (colG.includes('products-deciduous') || colG.includes('辦公室療癒')) categories.push('products-deciduous');
        if (colG.includes('products-mini') || colG.includes('風水招財')) categories.push('products-mini');
        if (colG.includes('products-caudex') || colG.includes('綠手指')) categories.push('products-caudex');
        if (colG.includes('tools') || colG.includes('資材用具')) categories.push('tools');

        subCategoryLabel = colH.includes('｜') ? colH.split('｜')[1].trim() : colH;

        if (colI.includes('首頁')) categories.push('index');
        if (colI.includes('嚴選新品')) categories.push('new-arrivals');

        if (colJ.includes('pet') || colJ.includes('巧遇')) template = 'pet';
        else if (colJ.includes('tool') || colJ.includes('資材')) template = 'tool';
        else template = 'bonsai';

        descOrTagline = val(10);
        spec1 = val(11);
        spec2 = val(12);
        spec3 = val(13);
        spec4 = val(14);
    } else {
        categories = colG.split(',').map(s => s.trim()).filter(Boolean);
        template = colH || 'bonsai';
        descOrTagline = val(8);
        spec1 = val(9);
        spec2 = val(10);
        spec3 = val(11);
        spec4 = val(12);
    }

    const legacyUrlMap = {
        'CG-SB002': 'shimpaku.html',
        'CG-BP001': 'black-pine.html',
        'CG-RM003': 'red-maple.html',
        'CG-LH001': 'luohan-detail.html',
        'CG-FN001': 'fern-detail.html'
    };

    return {
        id: id,
        status: status,
        title: title,
        price: priceRaw,
        image: image,
        badge: badge,
        categories: categories,
        subCategoryLabel: subCategoryLabel,
        template: template,
        url: legacyUrlMap[id] || (`product.html?id=${encodeURIComponent(id)}`),
        tagline: descOrTagline,
        files: {
            species: spec1 || '--',
            age: spec2 || '--',
            size: spec3 || '--',
            pot: spec4 || '--'
        },
        petDetails: {
            desc: descOrTagline,
            light: spec1 || '半日照 / 通風',
            water: spec2 || '土乾澆透',
            safe: spec3 || '100% 寵物無害',
            qiaoyu: spec4
        }
    };
}

window.__onCatGazeSheetLoaded = function(response) {
    if (!response || !response.table || !Array.isArray(response.table.rows)) return;
    const pageKey = getCurrentPageKey();
    const rows = response.table.rows;

    const wrongCardInCat = document.querySelector('.categories-section [id^="cloud-prod-"]');
    if (wrongCardInCat) wrongCardInCat.remove();

    rows.forEach((r) => {
        if (!r || !r.c) return;
        const p = parseSheetRowToProduct(r.c);
        if (!p.id || p.id === '商品代號(id)') return;
        window.__CATGAZE_SHEET_PRODUCTS__[p.id] = p;

        if (p.status === '下架') {
            const matchedStatic = findMatchingStaticCard(p);
            if (matchedStatic) matchedStatic.style.display = 'none';
            const dynamicEl = document.getElementById('cloud-prod-' + p.id);
            if (dynamicEl) dynamicEl.style.display = 'none';
            return;
        }

        if (p.status === '既有基準') {
            const matchedStatic = findMatchingStaticCard(p);
            if (matchedStatic) enhanceExistingStaticCard(matchedStatic, p);
            return;
        }

        if (p.status === '上架' && p.categories.includes(pageKey)) {
            insertProductCardOnPage(p, pageKey);
        }
    });

    syncLegacyDetailPageFromSheet(window.__CATGAZE_SHEET_PRODUCTS__);
    bindDynamicCategoryFilters();

    if (typeof window.__onSheetProductsReady === 'function') {
        window.__onSheetProductsReady(window.__CATGAZE_SHEET_PRODUCTS__);
    }
};

function loadCloudProductsFromBothSources() {
    const pageKey = getCurrentPageKey();

    if (database) {
        database.ref('products').once('value', (snap) => {
            const prodsObj = snap.val();
            if (!prodsObj) return;
            Object.values(prodsObj).forEach(p => {
                if (p && p.id) {
                    window.__CATGAZE_SHEET_PRODUCTS__[p.id] = p;
                }
                if (p && Array.isArray(p.categories) && p.categories.includes(pageKey)) {
                    insertProductCardOnPage(p, pageKey);
                }
            });
        });
    }

    if (CATGAZE_SHEET_ID) {
        const sc = document.createElement('script');
        sc.src = `https://docs.google.com/spreadsheets/d/${CATGAZE_SHEET_ID}/gviz/tq?tqx=responseHandler:__onCatGazeSheetLoaded`;
        sc.async = true;
        document.body.appendChild(sc);
    }
}

// ==========================================================================
// 🐈 AI 巧遇店長（✨巧遇動畫 ＋ 🎨巧遇插畫）：HTML5 Canvas 即時合成無損眨眼與和室盆景動態劇場
// ==========================================================================
let qiaoyuAnimTimer = null;
let qiaoyuAnimStep = 0;
let compositedBlinkAvatar = null;

// 利用已驗證 100% 清晰的 illus_open 與 3KB 眨眼貼片在瀏覽器內自動合成無損眨眼幀
function initCompositedQiaoyuFrames() {
    const baseImg = new Image();
    const patchImg = new Image();
    let loaded = 0;
    function onBothLoaded() {
        loaded++;
        if (loaded < 2) return;
        try {
            const c = document.createElement('canvas');
            c.width = 160;
            c.height = 160;
            const ctx = c.getContext('2d');
            ctx.drawImage(baseImg, 0, 0, 160, 160);
            ctx.drawImage(patchImg, 24, 40, 112, 40);
            compositedBlinkAvatar = c.toDataURL('image/jpeg', 0.92);
        } catch (e) {
            compositedBlinkAvatar = QIAOYU_MEDIA.illus_open;
        }
    }
    baseImg.onload = onBothLoaded;
    patchImg.onload = onBothLoaded;
    baseImg.src = QIAOYU_MEDIA.illus_open;
    patchImg.src = QIAOYU_MEDIA.eye_patch;
}

function getQiaoyuMode() {
    const saved = localStorage.getItem('CatGazeQiaoyuMode') || 'anim';
    if (saved !== 'anim' && saved !== 'illus') return 'anim';
    return saved;
}

function applyQiaoyuVisualState(isBlinking, isGazingBonsai) {
    const src = (isBlinking && compositedBlinkAvatar) ? compositedBlinkAvatar : QIAOYU_MEDIA.illus_open;
    document.querySelectorAll('.qiaoyu-dynamic-avatar').forEach(img => {
        img.src = src;
    });

    const stageCatWrap = document.getElementById('qiaoyu-stage-cat-actor');
    const stageBonsaiWrap = document.getElementById('qiaoyu-stage-bonsai-actor');
    const stageSparkle = document.getElementById('qiaoyu-stage-gaze-line');

    if (stageCatWrap) {
        if (isGazingBonsai) {
            stageCatWrap.style.transform = 'translateX(-5px) rotate(-4deg) scale(1.04)';
            if (stageBonsaiWrap) stageBonsaiWrap.style.transform = 'scale(1.06) rotate(1.5deg)';
            if (stageSparkle) stageSparkle.style.opacity = '1';
        } else {
            stageCatWrap.style.transform = 'translateX(0) rotate(0deg) scale(1)';
            if (stageBonsaiWrap) stageBonsaiWrap.style.transform = 'scale(1) rotate(0deg)';
            if (stageSparkle) stageSparkle.style.opacity = '0';
        }
    }
}

function syncStaticPageQiaoyuAvatars() {
    document.querySelectorAll('p, span, a, div, li').forEach(el => {
        if (el.children.length === 0 && el.textContent && el.textContent.includes('@catgaze')) {
            el.innerHTML = el.textContent.replace('@catgaze', '<a href="https://line.me/R/ti/p/@201zilzp" target="_blank" style="color:#06C755; font-weight:700; text-decoration:underline;">@201zilzp（點此加入 LINE 官方帳號）</a>');
        }
    });
    document.querySelectorAll('.qiaoyu-avatar, img[src="qiaoyu.jpg"]').forEach(img => {
        if (!img.classList.contains('qiaoyu-dynamic-avatar')) {
            img.src = QIAOYU_MEDIA.illus_open;
        }
    });
}

function startOrUpdateQiaoyuAnimationEngine() {
    if (qiaoyuAnimTimer) {
        clearTimeout(qiaoyuAnimTimer);
        qiaoyuAnimTimer = null;
    }

    const mode = getQiaoyuMode();
    const stageBadge = document.getElementById('qiaoyu-stage-badge');
    const stageCard = document.getElementById('qiaoyu-live-stage-card');

    if (mode === 'illus') {
        applyQiaoyuVisualState(false, false);
        if (stageBadge) stageBadge.innerText = '🎨 巧遇插畫（點擊可切換為巧遇動畫）';
        if (stageCard) stageCard.classList.remove('anim-running');
        return;
    }

    if (stageBadge) stageBadge.innerText = '✨ 巧遇動畫（自然眨眼＆凝視真柏盆景）';
    if (stageCard) stageCard.classList.add('anim-running');

    // 100% 零色塊無損動態時間軸
    const timeline = [
        { blink: false, gaze: false, duration: 2400 }, // 正面綠眼凝視
        { blink: true,  gaze: false, duration: 210 },  // 自然輕眨眼
        { blink: false, gaze: false, duration: 1900 }, // 正面凝視
        { blink: true,  gaze: true,  duration: 180 },  // 眨眼準備轉頭
        { blink: false, gaze: true,  duration: 1600 }, // 傾身凝視身旁的系魚川真柏盆景
        { blink: true,  gaze: false, duration: 200 },  // 輕眨眼回正
        { blink: false, gaze: false, duration: 1600 }, // 正面凝視
        { blink: true,  gaze: false, duration: 160 },  // 雙眨眼 1
        { blink: false, gaze: false, duration: 160 },  // 睜眼
        { blink: true,  gaze: false, duration: 190 }   // 雙眨眼 2
    ];

    function runNextFrame() {
        if (getQiaoyuMode() !== 'anim') return;
        const stepObj = timeline[qiaoyuAnimStep % timeline.length];
        applyQiaoyuVisualState(stepObj.blink, stepObj.gaze);
        qiaoyuAnimStep = (qiaoyuAnimStep + 1) % timeline.length;
        qiaoyuAnimTimer = setTimeout(runNextFrame, stepObj.duration);
    }

    runNextFrame();
}

function triggerQiaoyuTalkingBurst() {
    const fabBtn = document.getElementById('qiaoyu-fab-btn');
    if (fabBtn) {
        fabBtn.classList.remove('qiaoyu-talking');
        void fabBtn.offsetWidth;
        fabBtn.classList.add('qiaoyu-talking');
    }
    applyQiaoyuVisualState(true, false);
    setTimeout(() => applyQiaoyuVisualState(false, true), 180);
    setTimeout(() => applyQiaoyuVisualState(false, false), 650);
}

window.switchQiaoyuMode = function(modeKey, quiet) {
    if (modeKey !== 'anim' && modeKey !== 'illus') modeKey = 'anim';
    localStorage.setItem('CatGazeQiaoyuMode', modeKey);

    document.querySelectorAll('.qiaoyu-style-pill').forEach(btn => {
        if (btn.getAttribute('data-mode') === modeKey) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    startOrUpdateQiaoyuAnimationEngine();

    if (!quiet) {
        const modeMessages = {
            anim: '✨ <strong>已切換為【巧遇動畫模式】</strong><br>喵嗚～注意看本喵的翡翠綠眼睛會自然眨呀眨，偶爾還會傾身去凝視旁邊那盆系魚川真柏喔🐾！',
            illus: '🎨 <strong>已切換為【巧遇插畫模式】</strong><br>戴上 Qiaoyu 專屬名牌端坐值班中！有任何選植或澆水問題儘管問本喵～'
        };
        if (modeMessages[modeKey]) {
            appendQiaoyuBotMessage(modeMessages[modeKey], []);
        }
    }
};

function injectQiaoyuManagerWidget() {
    const pageKey = getCurrentPageKey();
    if (pageKey === 'admin') return;
    if (document.getElementById('qiaoyu-ai-root')) return;
    if (!document.body) return;

    initCompositedQiaoyuFrames();

    const currentMode = getQiaoyuMode();
    const initialAvatar = QIAOYU_MEDIA.illus_open;

    const styleEl = document.createElement('style');
    styleEl.textContent = `
        #qiaoyu-ai-root {
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 1500;
            font-family: 'Noto Sans TC', sans-serif;
        }
        #qiaoyu-teaser-bubble {
            position: absolute;
            bottom: 88px;
            right: 0;
            background: #ffffff;
            color: #3d4a35;
            border: 2px solid #7F916A;
            padding: 10px 32px 10px 14px;
            border-radius: 18px 18px 4px 18px;
            box-shadow: 0 8px 25px rgba(93, 112, 101, 0.25);
            font-size: 0.86rem;
            font-weight: 700;
            white-space: nowrap;
            cursor: pointer;
            transition: 0.3s;
            animation: qiaoyuFloat 3s ease-in-out infinite;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        #qiaoyu-teaser-bubble:hover { transform: translateY(-3px); }
        #qiaoyu-teaser-close {
            position: absolute;
            top: 5px;
            right: 8px;
            border: none;
            background: none;
            color: #aaa;
            font-size: 0.78rem;
            cursor: pointer;
            padding: 2px;
        }
        @keyframes qiaoyuFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
        }
        @keyframes qiaoyuPulseRing {
            0% { box-shadow: 0 0 0 0 rgba(127, 145, 106, 0.55), 0 10px 28px rgba(60, 75, 55, 0.42); }
            70% { box-shadow: 0 0 0 12px rgba(127, 145, 106, 0), 0 14px 32px rgba(60, 75, 55, 0.48); }
            100% { box-shadow: 0 0 0 0 rgba(127, 145, 106, 0), 0 10px 28px rgba(60, 75, 55, 0.42); }
        }
        @keyframes qiaoyuBreath {
            0%, 100% { transform: scale(1) rotate(0deg); }
            50% { transform: scale(1.035) rotate(1.2deg); }
        }
        @keyframes qiaoyuTalkBounce {
            0%, 100% { transform: scale(1); }
            25% { transform: scale(1.1) translateY(-4px); }
            50% { transform: scale(0.97); }
            75% { transform: scale(1.06) translateY(-2px); }
        }
        @keyframes qiaoyuLeafDrift {
            0% { opacity: 0; transform: translate(0, 8px) scale(0.7) rotate(0deg); }
            30% { opacity: 0.95; }
            100% { opacity: 0; transform: translate(-14px, -26px) scale(1.1) rotate(-25deg); }
        }
        @keyframes qiaoyuBonsaiSway {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(1.8deg); }
        }
        #qiaoyu-fab-btn {
            width: 74px;
            height: 74px;
            border-radius: 50%;
            background: linear-gradient(135deg, #7F916A 0%, #5d7065 100%);
            border: 3px solid #FDFAD9;
            cursor: pointer;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
            overflow: visible;
            animation: qiaoyuPulseRing 3s infinite, qiaoyuBreath 4s ease-in-out infinite;
        }
        #qiaoyu-fab-btn.qiaoyu-talking {
            animation: qiaoyuTalkBounce 0.6s ease-in-out 2;
        }
        #qiaoyu-fab-btn:hover {
            transform: scale(1.08);
        }
        #qiaoyu-fab-avatar {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
            display: block;
        }
        .qiaoyu-floating-leaf {
            position: absolute;
            top: -6px;
            left: -6px;
            font-size: 0.95rem;
            pointer-events: none;
            animation: qiaoyuLeafDrift 3.6s ease-in-out infinite;
        }
        .qiaoyu-fab-badge {
            position: absolute;
            bottom: -5px;
            left: 50%;
            transform: translateX(-50%);
            background: #7F916A;
            color: #FDFAD9;
            font-size: 0.68rem;
            font-weight: 700;
            padding: 1px 8px;
            border-radius: 10px;
            border: 1.5px solid #FDFAD9;
            white-space: nowrap;
            box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
        .qiaoyu-online-dot {
            position: absolute;
            top: 2px;
            right: 2px;
            width: 14px;
            height: 14px;
            background: #2ecc71;
            border: 2px solid #ffffff;
            border-radius: 50%;
        }

        /* 巧遇店長聊天室主視窗 */
        #qiaoyu-chat-window {
            display: none;
            position: fixed;
            bottom: 108px;
            right: 24px;
            width: 385px;
            max-width: calc(100vw - 32px);
            height: 590px;
            max-height: calc(100vh - 135px);
            background: #fcfcf8;
            border-radius: 20px;
            box-shadow: 0 20px 55px rgba(0, 0, 0, 0.22);
            border: 1px solid #dce5d5;
            flex-direction: column;
            overflow: hidden;
            z-index: 1501;
        }
        #qiaoyu-chat-window.open {
            display: flex;
            animation: qiaoyuPopIn 0.25s ease-out;
        }
        @keyframes qiaoyuPopIn {
            from { opacity: 0; transform: translateY(15px) scale(0.96); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .qiaoyu-chat-header {
            background: linear-gradient(135deg, #6d8058 0%, #4e6156 100%);
            color: white;
            padding: 12px 16px 10px 16px;
        }
        .qiaoyu-header-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .qiaoyu-header-info {
            display: flex;
            align-items: center;
            gap: 11px;
        }
        .qiaoyu-header-avatar {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            border: 2.5px solid #FDFAD9;
            object-fit: cover;
            background: #FDFAD9;
            flex-shrink: 0;
        }
        .qiaoyu-header-title {
            font-weight: 700;
            font-size: 1.02rem;
            letter-spacing: 0.5px;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .qiaoyu-header-sub {
            font-size: 0.74rem;
            color: #FDFAD9;
            opacity: 0.94;
            margin-top: 2px;
        }
        .qiaoyu-close-btn {
            background: rgba(255,255,255,0.18);
            color: white;
            border: none;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 0.95rem;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .qiaoyu-close-btn:hover { background: rgba(255,255,255,0.3); }

        /* 巧遇模式切換列（✨巧遇動畫 / 🎨巧遇插畫） */
        .qiaoyu-style-bar {
            display: flex;
            gap: 8px;
            margin-top: 9px;
            padding-top: 8px;
            border-top: 1px solid rgba(255,255,255,0.16);
        }
        .qiaoyu-style-pill {
            flex: 1;
            text-align: center;
            background: rgba(255,255,255,0.14);
            color: #FDFAD9;
            border: 1px solid rgba(253,250,217,0.3);
            border-radius: 14px;
            padding: 4px 10px;
            font-size: 0.76rem;
            cursor: pointer;
            white-space: nowrap;
            transition: 0.2s;
            font-weight: 600;
        }
        .qiaoyu-style-pill:hover, .qiaoyu-style-pill.active {
            background: #FDFAD9;
            color: #4e6156;
            border-color: #FDFAD9;
            font-weight: 700;
        }

        /* 訊息捲動區 */
        #qiaoyu-messages-box {
            flex: 1;
            overflow-y: auto;
            padding: 14px;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .q-msg-row {
            display: flex;
            gap: 8px;
            align-items: flex-start;
        }
        .q-msg-row.user {
            flex-direction: row-reverse;
        }
        .q-msg-avatar {
            width: 34px;
            height: 34px;
            border-radius: 50%;
            object-fit: cover;
            border: 1.5px solid #7F916A;
            flex-shrink: 0;
            background: #FDFAD9;
        }
        .q-msg-bubble {
            max-width: 84%;
            padding: 11px 14px;
            border-radius: 15px;
            font-size: 0.87rem;
            line-height: 1.55;
            word-break: break-word;
        }
        .q-msg-row.bot .q-msg-bubble {
            background: #ffffff;
            color: #444;
            border: 1px solid #e6ece0;
            border-top-left-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.03);
        }
        .q-msg-row.user .q-msg-bubble {
            background: #7F916A;
            color: #ffffff;
            border-top-right-radius: 4px;
        }

        /* 歡迎詞內嵌「日式和室猫眼盆栽動態小劇場」（純向量盆景＋已驗證清晰巧遇頭像，100% 零色塊） */
        .qiaoyu-stage-wrap {
            margin: 8px 0;
        }
        .qiaoyu-stage-card {
            position: relative;
            border-radius: 12px;
            overflow: hidden;
            border: 1.5px solid #cdd9c5;
            cursor: pointer;
            background: linear-gradient(180deg, #f7f3e3 0%, #ede6cf 72%, #c9ab81 72%, #b59469 100%);
            height: 148px;
            width: 100%;
            display: flex;
            align-items: flex-end;
            justify-content: space-around;
            padding: 0 12px 26px 12px;
            box-sizing: border-box;
            box-shadow: inset 0 0 20px rgba(127, 145, 106, 0.12);
        }
        /* 和室障子窗格背景線條 */
        .qiaoyu-stage-shoji {
            position: absolute;
            top: 0;
            left: 0;
            width: 55%;
            height: 72%;
            background-image:
                linear-gradient(to right, rgba(160,130,90,0.18) 2px, transparent 2px),
                linear-gradient(to bottom, rgba(160,130,90,0.18) 2px, transparent 2px);
            background-size: 28px 26px;
            border-right: 3px solid rgba(150,120,80,0.28);
            pointer-events: none;
        }
        #qiaoyu-stage-bonsai-actor {
            position: relative;
            z-index: 2;
            width: 105px;
            height: 105px;
            transition: transform 0.45s ease;
            transform-origin: bottom center;
        }
        .qiaoyu-stage-card.anim-running #qiaoyu-stage-bonsai-actor {
            animation: qiaoyuBonsaiSway 3.5s ease-in-out infinite;
        }
        #qiaoyu-stage-gaze-line {
            position: absolute;
            top: 38px;
            left: 46%;
            transform: translateX(-50%);
            z-index: 3;
            font-size: 0.75rem;
            color: #5a6b47;
            background: rgba(253, 250, 217, 0.92);
            border: 1px solid #7F916A;
            padding: 2px 7px;
            border-radius: 10px;
            font-weight: 700;
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
            white-space: nowrap;
        }
        #qiaoyu-stage-cat-actor {
            position: relative;
            z-index: 2;
            width: 96px;
            height: 96px;
            border-radius: 50%;
            border: 3px solid #FDFAD9;
            box-shadow: 0 6px 16px rgba(60, 50, 35, 0.22);
            overflow: hidden;
            background: #FDFAD9;
            transition: transform 0.35s ease;
            flex-shrink: 0;
        }
        #qiaoyu-stage-cat-actor img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }
        .qiaoyu-stage-label {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(62, 77, 56, 0.88);
            color: #FDFAD9;
            font-size: 0.72rem;
            padding: 4px 8px;
            text-align: center;
            font-weight: 700;
            letter-spacing: 0.4px;
            z-index: 4;
        }

        /* 對話內嵌推薦植物卡片 */
        .q-rec-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-top: 10px;
        }
        .q-rec-card {
            display: flex;
            gap: 10px;
            background: #f9fbf7;
            border: 1px solid #dce5d5;
            border-radius: 10px;
            padding: 8px;
            align-items: center;
        }
        .q-rec-img {
            width: 54px;
            height: 54px;
            border-radius: 8px;
            object-fit: cover;
            background: #eee;
            flex-shrink: 0;
        }
        .q-rec-info {
            flex: 1;
            min-width: 0;
        }
        .q-rec-title {
            font-weight: 700;
            font-size: 0.84rem;
            color: #333;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .q-rec-price {
            color: #d14900;
            font-weight: 700;
            font-size: 0.82rem;
            margin-top: 2px;
        }
        .q-rec-actions {
            display: flex;
            gap: 5px;
            margin-top: 4px;
        }
        .q-rec-btn-view {
            text-decoration: none;
            background: white;
            color: #7F916A;
            border: 1px solid #7F916A;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.74rem;
            font-weight: 700;
        }
        .q-rec-btn-buy {
            background: #7F916A;
            color: white;
            border: none;
            padding: 2px 9px;
            border-radius: 12px;
            font-size: 0.74rem;
            font-weight: 700;
            cursor: pointer;
        }

        /* 快捷問題膠囊區 */
        .qiaoyu-quick-chips {
            padding: 8px 12px;
            background: #f4f7f1;
            border-top: 1px solid #e6ece0;
            display: flex;
            gap: 6px;
            overflow-x: auto;
            white-space: nowrap;
            scrollbar-width: thin;
        }
        .q-chip-btn {
            background: #ffffff;
            color: #5a6b47;
            border: 1px solid #cdd9c5;
            padding: 5px 11px;
            border-radius: 16px;
            font-size: 0.78rem;
            font-weight: 600;
            cursor: pointer;
            transition: 0.2s;
            flex-shrink: 0;
        }
        .q-chip-btn:hover {
            background: #7F916A;
            color: #ffffff;
            border-color: #7F916A;
        }

        /* 底部輸入框 */
        .qiaoyu-input-area {
            display: flex;
            gap: 8px;
            padding: 10px 12px;
            background: #ffffff;
            border-top: 1px solid #eeeeee;
            align-items: center;
        }
        #qiaoyu-user-input {
            flex: 1;
            border: 1px solid #ddd;
            border-radius: 20px;
            padding: 8px 14px;
            font-size: 0.88rem;
            outline: none;
            font-family: inherit;
        }
        #qiaoyu-user-input:focus { border-color: #7F916A; }
        .qiaoyu-send-btn {
            background: #7F916A;
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 20px;
            font-weight: 700;
            font-size: 0.85rem;
            cursor: pointer;
        }
        .qiaoyu-send-btn:hover { background: #5d7065; }
    `;
    document.head.appendChild(styleEl);

    const widgetRoot = document.createElement('div');
    widgetRoot.id = 'qiaoyu-ai-root';
    widgetRoot.innerHTML = `
        <div id="qiaoyu-teaser-bubble" onclick="window.toggleQiaoyuChat(true)">
            <span>🐾 喵～我是巧遇店長，點我幫你挑盆栽！</span>
            <button id="qiaoyu-teaser-close" onclick="event.stopPropagation(); document.getElementById('qiaoyu-teaser-bubble').style.display='none';">✕</button>
        </div>

        <button id="qiaoyu-fab-btn" onclick="window.toggleQiaoyuChat()" title="呼叫 AI 巧遇店長">
            <span class="qiaoyu-floating-leaf">🌿</span>
            <img id="qiaoyu-fab-avatar" class="qiaoyu-dynamic-avatar" src="${initialAvatar}" alt="巧遇店長">
            <span class="qiaoyu-online-dot"></span>
            <span class="qiaoyu-fab-badge">🐾 巧遇店長</span>
        </button>

        <div id="qiaoyu-chat-window">
            <div class="qiaoyu-chat-header">
                <div class="qiaoyu-header-top">
                    <div class="qiaoyu-header-info">
                        <img class="qiaoyu-header-avatar qiaoyu-dynamic-avatar" src="${initialAvatar}" alt="巧遇店長">
                        <div>
                            <div class="qiaoyu-header-title">🐈 AI 巧遇店長</div>
                            <div class="qiaoyu-header-sub">Cat Gaze 虎斑店貓（綠眼凝視值班中）</div>
                        </div>
                    </div>
                    <button class="qiaoyu-close-btn" onclick="window.toggleQiaoyuChat(false)">✕</button>
                </div>
                <div class="qiaoyu-style-bar">
                    <button type="button" class="qiaoyu-style-pill ${currentMode === 'anim' ? 'active' : ''}" data-mode="anim" onclick="window.switchQiaoyuMode('anim')">✨ 巧遇動畫</button>
                    <button type="button" class="qiaoyu-style-pill ${currentMode === 'illus' ? 'active' : ''}" data-mode="illus" onclick="window.switchQiaoyuMode('illus')">🎨 巧遇插畫</button>
                    <a href="https://line.me/R/ti/p/@201zilzp" target="_blank" rel="noopener" class="qiaoyu-style-pill" style="text-decoration:none; background:#06C755; color:#ffffff; border-color:#06C755; font-weight:700;">💬 LINE 客服 (@201zilzp)</a>
                </div>
            </div>

            <div id="qiaoyu-messages-box"></div>

            <div class="qiaoyu-quick-chips">
                <button class="q-chip-btn" onclick="window.askQiaoyu('🐱 家有養貓推薦哪盆？')">🐱 家有養貓推薦</button>
                <button class="q-chip-btn" onclick="window.askQiaoyu('💻 辦公桌與室內耐陰推薦')">💻 辦公桌耐陰</button>
                <button class="q-chip-btn" onclick="window.askQiaoyu('🌲 陽台喜光松柏盆景推薦')">🌲 松柏盆景推薦</button>
                <button class="q-chip-btn" onclick="window.askQiaoyu('💧 怎麼判斷植物該澆水了？')">💧 澆水判斷法</button>
                <button class="q-chip-btn" onclick="window.askQiaoyu('🪴 赤玉土跟修剪工具推薦')">🪴 介質與工具</button>
                <button class="q-chip-btn" style="border-color:#06C755; color:#059669;" onclick="window.open('https://line.me/R/ti/p/@201zilzp', '_blank')">💬 加 LINE 診斷 (@201zilzp)</button>
            </div>

            <form class="qiaoyu-input-area" onsubmit="window.submitQiaoyuInput(event)">
                <input type="text" id="qiaoyu-user-input" placeholder="問問巧遇店長（例：養貓推薦、預算1500、怎麼澆水）..." autocomplete="off">
                <button type="submit" class="qiaoyu-send-btn">傳送</button>
            </form>
        </div>
    `;
    document.body.appendChild(widgetRoot);

    // 滑鼠移到右下角圓形頭像時，巧遇會自然眨眼問候
    const fabBtn = document.getElementById('qiaoyu-fab-btn');
    if (fabBtn) {
        fabBtn.addEventListener('mouseenter', () => {
            applyQiaoyuVisualState(true, true);
            setTimeout(() => applyQiaoyuVisualState(false, true), 220);
        });
        fabBtn.addEventListener('mouseleave', () => {
            applyQiaoyuVisualState(false, false);
        });
    }

    // 初始歡迎詞（內嵌 100% 零色塊的「日式和室猫眼盆栽動態小劇場」）
    const bonsaiSvg = `
        <svg viewBox="0 0 120 115" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <!-- 木牌：猫眼盆栽 -->
            <rect x="6" y="68" width="22" height="40" rx="2" fill="#e6cca0" stroke="#5c4328" stroke-width="2"/>
            <text x="17" y="80" font-size="7.5" font-weight="bold" fill="#3b2a18" text-anchor="middle">猫</text>
            <text x="17" y="90" font-size="7.5" font-weight="bold" fill="#3b2a18" text-anchor="middle">眼</text>
            <text x="17" y="100" font-size="7.5" font-weight="bold" fill="#3b2a18" text-anchor="middle">盆</text>
            <!-- 柴燒粗陶盆 -->
            <polygon points="36,78 98,78 90,108 44,108" fill="#8c6747" stroke="#4a3520" stroke-width="2"/>
            <rect x="33" y="73" width="68" height="6" rx="2" fill="#9c7554" stroke="#4a3520" stroke-width="2"/>
            <!-- 盆面青苔 -->
            <ellipse cx="67" cy="74" rx="28" ry="3.5" fill="#5c7a45"/>
            <!-- 真柏蒼勁扭幹 -->
            <path d="M65,74 Q52,58 64,45 Q75,34 58,24 M64,45 Q80,44 88,36 M59,55 Q44,52 38,44" stroke="#8c6d46" stroke-width="6" stroke-linecap="round" fill="none"/>
            <!-- 雲朵狀松柏翠葉 -->
            <ellipse cx="38" cy="42" rx="16" ry="9" fill="#4e733d" stroke="#2f4a22" stroke-width="1.8"/>
            <ellipse cx="88" cy="34" rx="17" ry="9" fill="#5a8247" stroke="#2f4a22" stroke-width="1.8"/>
            <ellipse cx="60" cy="21" rx="22" ry="11" fill="#689452" stroke="#2f4a22" stroke-width="1.8"/>
            <ellipse cx="66" cy="32" rx="16" ry="8" fill="#4e733d"/>
        </svg>
    `;

    appendQiaoyuBotMessage(
        `喵嗚～歡迎光臨 <strong>Cat Gaze 貓凝植栽</strong>！我是這裡的虎斑店貓店長「<strong>巧遇</strong>」🐾
        <div class="qiaoyu-stage-wrap">
            <div class="qiaoyu-stage-card anim-running" id="qiaoyu-live-stage-card" onclick="window.switchQiaoyuMode(getQiaoyuMode() === 'anim' ? 'illus' : 'anim')" title="點擊切換【巧遇動畫 / 巧遇插畫】">
                <div class="qiaoyu-stage-shoji"></div>
                <div id="qiaoyu-stage-bonsai-actor">${bonsaiSvg}</div>
                <div id="qiaoyu-stage-gaze-line">👀 凝視真柏中...</div>
                <div id="qiaoyu-stage-cat-actor">
                    <img class="qiaoyu-dynamic-avatar" src="${QIAOYU_MEDIA.illus_open}" alt="巧遇店長">
                </div>
                <div class="qiaoyu-stage-label" id="qiaoyu-stage-badge">✨ 巧遇動畫（自然眨眼＆凝視真柏盆景）</div>
            </div>
        </div>
        <div>想找<strong>對貓咪 100% 無毒的安全植物</strong>、<strong>辦公桌療癒小品</strong>，還是想問<strong>盆景怎麼澆水換土</strong>？直接點下方按鈕或打字問本喵就可以囉！</div>`,
        []
    );

    syncStaticPageQiaoyuAvatars();
    startOrUpdateQiaoyuAnimationEngine();
}

window.toggleQiaoyuChat = function(forceOpen) {
    const win = document.getElementById('qiaoyu-chat-window');
    const teaser = document.getElementById('qiaoyu-teaser-bubble');
    if (!win) return;
    const isOpen = forceOpen !== undefined ? forceOpen : !win.classList.contains('open');
    if (isOpen) {
        win.classList.add('open');
        if (teaser) teaser.style.display = 'none';
        triggerQiaoyuTalkingBurst();
        setTimeout(() => {
            const inp = document.getElementById('qiaoyu-user-input');
            if (inp) inp.focus();
        }, 150);
    } else {
        win.classList.remove('open');
    }
};

function appendQiaoyuUserMessage(text) {
    const box = document.getElementById('qiaoyu-messages-box');
    if (!box) return;
    const div = document.createElement('div');
    div.className = 'q-msg-row user';
    div.innerHTML = `<div class="q-msg-bubble">${text.replace(/</g, '&lt;')}</div>`;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}

function appendQiaoyuBotMessage(htmlText, recommendedProducts) {
    const box = document.getElementById('qiaoyu-messages-box');
    if (!box) return;
    const currentAvatar = QIAOYU_MEDIA.illus_open;

    let cardsHtml = '';
    if (Array.isArray(recommendedProducts) && recommendedProducts.length > 0) {
        cardsHtml = `<div class="q-rec-list">` + recommendedProducts.map(p => {
            const priceNum = Number(p.price) || 0;
            const safeTitle = (p.title || '').replace(/'/g, "\\'");
            const safeImg = (p.image || '').replace(/'/g, "\\'");
            const linkUrl = p.url || (`product.html?id=${encodeURIComponent(p.id)}`);
            return `
            <div class="q-rec-card">
                <img class="q-rec-img" src="${p.image}" alt="${p.title}" onerror="this.onerror=null; this.src='CG_logo w bg_vertica_green.png';">
                <div class="q-rec-info">
                    <div class="q-rec-title">${p.title}</div>
                    <div class="q-rec-price">NT$ ${priceNum.toLocaleString()}</div>
                    <div class="q-rec-actions">
                        <a href="${linkUrl}" class="q-rec-btn-view">看詳情</a>
                        <button type="button" class="q-rec-btn-buy" onclick="addToCart('${safeTitle}', ${priceNum}, '${safeImg}')">＋加入購物車</button>
                    </div>
                </div>
            </div>`;
        }).join('') + `</div>`;
    }

    const div = document.createElement('div');
    div.className = 'q-msg-row bot';
    div.innerHTML = `
        <img class="q-msg-avatar qiaoyu-dynamic-avatar" src="${currentAvatar}" alt="巧遇">
        <div class="q-msg-bubble">
            ${htmlText}
            ${cardsHtml}
        </div>
    `;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}

function getAllActiveCatalogProducts() {
    const map = Object.assign({}, DEFAULT_CATALOG_FALLBACK, window.__CATGAZE_SHEET_PRODUCTS__ || {});
    return Object.values(map).filter(p => p && p.status !== '下架');
}

function generateQiaoyuResponse(query) {
    const q = query.toLowerCase().trim();
    const allProds = getAllActiveCatalogProducts();

    // 1. 檢查是否詢問預算 (例如: 1500, 2000以內, 預算1000)
    const numMatch = q.match(/(\d{3,5})/);
    if (numMatch && (q.includes('預算') || q.includes('以內') || q.includes('以下') || q.includes('元') || q.includes('塊') || q.includes('便宜'))) {
        const budget = Number(numMatch[1]);
        const within = allProds.filter(p => Number(p.price) > 0 && Number(p.price) <= budget);
        if (within.length > 0) {
            return {
                text: `喵嗚！預算在 <strong>NT$ ${budget.toLocaleString()} 以內</strong> 的話，本喵店長幫你從店裡挑出這 ${within.length} 款高質感好物，可以直接點「＋加入購物車」帶回家喵：`,
                products: within.slice(0, 4)
            };
        }
    }

    // 2. 養貓 / 寵物安全 / 無毒詢問
    if (q.includes('貓') || q.includes('狗') || q.includes('寵物') || q.includes('無毒') || q.includes('安全') || q.includes('毛孩')) {
        if (q.includes('誤食') || q.includes('吃到') || q.includes('中毒') || q.includes('吐')) {
            return {
                text: `⚠️ <strong>巧遇店長緊急提醒：</strong><br>如果家裡主子不小心啃食到不明或有毒植物（如黃金葛、虎尾蘭、百合），請<strong>第一時間拍下植物照片，並立刻帶去給獸醫檢查，千萬不要自己催吐</strong>喵！<br><br>想看完整的安全植物清單，可以點此閱讀：<a href="article-pet-safe.html" style="color:#7F916A; font-weight:bold;">《10 種 ASPCA 認證對貓無毒植物指南》</a>，或者挑選本喵親自試聞認證的無毒植栽：`,
                products: allProds.filter(p => (p.categories && p.categories.includes('pet-friendly')) || p.template === 'pet').slice(0, 3)
            };
        }
        const petProds = allProds.filter(p => (p.categories && p.categories.includes('pet-friendly')) || p.template === 'pet');
        return {
            text: `身為虎斑貓店長，這題問本喵最準喵！🐾<br>以下這幾盆都是經過 <strong>ASPCA 認證 100% 對貓狗無毒</strong> 的精選植栽——喜歡陽光窗台首推「<strong>小葉羅漢松</strong>」，室內冷氣房耐陰首推「<strong>銀脈鳳尾蕨</strong>」跟會睡覺的「<strong>小豆樹</strong>」喵：`,
            products: petProds.slice(0, 4)
        };
    }

    // 3. 辦公室 / 室內 / 耐陰 / 桌面 / 新手
    if (q.includes('辦公') || q.includes('室內') || q.includes('耐陰') || q.includes('書桌') || q.includes('冷氣') || q.includes('新手') || q.includes('好養') || q.includes('小豆')) {
        const officeProds = allProds.filter(p =>
            p.id === 'CG-XD001' || p.id === 'CG-FN001' || p.id === 'CG-LH001' ||
            (p.categories && p.categories.includes('products-deciduous'))
        );
        return {
            text: `想放在辦公桌或室內窗邊療癒一下嗎喵？🌿<br>本喵特別推薦夜晚葉片會自己合起來睡覺的「<strong>小豆樹</strong>」、幫冷氣房保濕的「<strong>銀脈鳳尾蕨</strong>」，以及四季常青的「<strong>小葉羅漢松</strong>」，新手也超好照顧喵！`,
            products: officeProds.slice(0, 4)
        };
    }

    // 4. 澆水問題
    if (q.includes('澆水') || q.includes('水') || q.includes('乾透') || q.includes('枯') || q.includes('黃')) {
        return {
            text: `💧 <strong>巧遇店長的「澆水學三年」小筆記：</strong><br>千萬別每天只噴噴葉子或讓盆土一直濕答答喔！植物的根需要呼吸，請記住口訣<strong>「乾透澆透」</strong>：<br>1. <strong>怎麼看乾透？</strong> 觀察赤玉土表層變淺白色，或拿起來感覺盆子明顯變輕。<br>2. <strong>怎麼澆透？</strong> 緩慢澆水直到水從盆底排水孔大量流出來，把舊空氣換成新鮮氧氣！<br><br>📖 推薦閱讀：<a href="article-watering.html" style="color:#7F916A; font-weight:bold;">《乾透澆透：別讓關愛淹沒它的呼吸》</a>`,
            products: allProds.filter(p => p.id === 'CG-TL002' || p.id === 'CG-TL003')
        };
    }

    // 5. 土壤 / 介質 / 換盆 / 工具 / 剪刀
    if (q.includes('土') || q.includes('赤玉') || q.includes('介質') || q.includes('換盆') || q.includes('剪') || q.includes('工具') || q.includes('盆器') || q.includes('資材')) {
        const toolProds = allProds.filter(p => p.template === 'tool' || (p.categories && p.categories.includes('tools')));
        return {
            text: `🪴 <strong>「養樹先養根，工欲善其事必先利其器喵！」</strong><br>• <strong>黃金混土比例</strong>：松柏類建議「赤玉土 70%＋砂石 20%＋腐植土 10%」；雜木與觀葉可提高保水比例（詳見 <a href="article-soil-mix.html" style="color:#7F916A; font-weight:bold;">《萬用土調配全攻略》</a>）。<br>• 以下三款是我們店裡最推薦的日本三本線極硬質赤玉土、黑鋼剪定鋏與手作柴燒盆：`,
            products: toolProds
        };
    }

    // 6. 松柏 / 真柏 / 黑松 / 紅楓 / 陽台 / 摘芽
    if (q.includes('松') || q.includes('柏') || q.includes('楓') || q.includes('陽台') || q.includes('摘芽') || q.includes('盆景')) {
        const bonsaiProds = allProds.filter(p => p.id === 'CG-SB002' || p.id === 'CG-BP001' || p.id === 'CG-RM003' || p.template === 'bonsai');
        return {
            text: `🌲 眼光真好喵！如果你家有通風明亮的陽台或窗台，雲朵造型的<strong>系魚川真柏</strong>、蒼勁文人風的<strong>日本黑松</strong>，以及四季變色的<strong>日本紅楓</strong>都是「一樹一拍、僅此一盆」的收藏級作品喵：`,
            products: bonsaiProds.slice(0, 4)
        };
    }

    // 7. 風水 / 招財 / 送禮 / 開幕
    if (q.includes('風水') || q.includes('招財') || q.includes('桃花') || q.includes('送禮') || q.includes('開幕') || q.includes('喬遷')) {
        const giftProds = allProds.filter(p => p.id === 'CG-LH001' || p.id === 'CG-SB002' || (p.categories && p.categories.includes('products-mini')));
        return {
            text: `🎁 想挑新居落成、開幕送禮或居家招財開運植栽嗎喵？<br>傳統象徵長壽守財又對寵物無毒的「<strong>小葉羅漢松</strong>」、氣勢沉穩的「<strong>系魚川真柏</strong>」，或是前往 <a href="products-mini.html" style="color:#7F916A; font-weight:bold;">【風水招財、桃花類專區】</a> 挑選斑葉龜背芋都非常體面喵！`,
            products: giftProds.slice(0, 3)
        };
    }

    // 8. 預設萬用回答
    return {
        text: `喵嗚～本喵收到你的問題了！🐾<br>你可以試著問我：<strong>「養貓推薦哪盆？」、「辦公桌耐陰植物」、「預算 1500 以內」或「怎麼澆水？」</strong>。<br><br>以下這幾盆是本喵店長本週最推薦的人氣精選，你也可以點 <a href="contact.html" style="color:#7F916A; font-weight:bold;">【聯繫我們】</a> 找人類店長替你一對一解答喵：`,
        products: allProds.slice(0, 3)
    };
}

window.askQiaoyu = function(questionText) {
    if (!questionText) return;
    window.toggleQiaoyuChat(true);
    appendQiaoyuUserMessage(questionText);
    triggerQiaoyuTalkingBurst();
    setTimeout(() => {
        const reply = generateQiaoyuResponse(questionText);
        appendQiaoyuBotMessage(reply.text, reply.products);
    }, 240);
};

window.submitQiaoyuInput = function(e) {
    e.preventDefault();
    const inp = document.getElementById('qiaoyu-user-input');
    if (!inp || !inp.value.trim()) return;
    const text = inp.value.trim();
    inp.value = '';
    window.askQiaoyu(text);
};

// ==========================================================================
// 全站自動 SEO 結構化資料 (JSON-LD Schema) 注入器
// ==========================================================================
function injectAutoSEOSchema() {
    const baseUrl = "https://change-tw.github.io/cat-gaze/";
    const pageKey = getCurrentPageKey();

    if (!document.querySelector('link[rel="canonical"]')) {
        const link = document.createElement('link');
        link.rel = 'canonical';
        link.href = baseUrl + (pageKey === 'index' ? '' : (pageKey + '.html')) + (window.location.search || '');
        document.head.appendChild(link);
    }

    if (pageKey === 'index') {
        const orgSchema = {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Cat Gaze 貓凝植栽",
            "url": baseUrl,
            "logo": baseUrl + "CG_logo%20w%20bg_vertica_green.png",
            "description": "透過貓眼凝視，發掘植栽的靈魂。專營日本黑松、系魚川真柏、小品盆景、ASPCA認證100%對貓無毒寵物友善植物與日本盆景資材。",
            "sameAs": [
                "https://www.instagram.com/catgaze_bonsai"
            ]
        };
        const sc = document.createElement('script');
        sc.type = 'application/ld+json';
        sc.textContent = JSON.stringify(orgSchema);
        document.head.appendChild(sc);
    }

    setTimeout(() => {
        const titleEl = document.querySelector('#display-title, .product-info-section .product-title, .info-section h1, .pet-info-col h1');
        const priceEl = document.querySelector('#display-price, .price-tag, .info-section .price');
        const imgEl = document.querySelector('#display-img, .product-image-section img, .image-gallery img, .pet-img-col img');
        if (titleEl && priceEl) {
            const prodName = titleEl.innerText.trim();
            const priceVal = Number(priceEl.innerText.replace(/[^0-9.]/g, '')) || 0;
            const imgSrc = imgEl ? imgEl.getAttribute('src') : 'CG_logo w bg_vertica_green.png';
            if (prodName && priceVal > 0 && prodName !== '載入中...') {
                const prodSchema = {
                    "@context": "https://schema.org/",
                    "@type": "Product",
                    "name": prodName,
                    "image": imgSrc.startsWith('http') ? imgSrc : (baseUrl + imgSrc),
                    "description": document.title + " - Cat Gaze 貓凝植栽嚴選，實品拍攝出貨。",
                    "brand": {
                        "@type": "Brand",
                        "name": "Cat Gaze 貓凝植栽"
                    },
                    "offers": {
                        "@type": "Offer",
                        "url": window.location.href,
                        "priceCurrency": "TWD",
                        "price": priceVal,
                        "availability": "https://schema.org/InStock",
                        "itemCondition": "https://schema.org/NewCondition"
                    }
                };
                const sc = document.createElement('script');
                sc.type = 'application/ld+json';
                sc.textContent = JSON.stringify(prodSchema);
                document.head.appendChild(sc);
            }
        }
    }, 1500);
}

// 立即掛載巧遇店長
if (document.body) {
    try { injectQiaoyuManagerWidget(); } catch (e) {}
}
document.addEventListener('DOMContentLoaded', function() {
    try { injectQiaoyuManagerWidget(); } catch (e) {}
});

window.addEventListener('load', function() {
    updateCount();
    renderCart();
    loadCloudProductsFromBothSources();
    injectQiaoyuManagerWidget();
    syncStaticPageQiaoyuAvatars();
    injectAutoSEOSchema();

    const userKey = getUserKey();
    if (userKey && database) {
        database.ref('carts/' + userKey).once('value', (snapshot) => {
            const cloudCart = snapshot.val();
            if (cloudCart && Array.isArray(cloudCart)) {
                cart = cloudCart;
                localStorage.setItem('CatGazeCart', JSON.stringify(cart));
                updateCount();
                renderCart();
            }
        });
    }
});