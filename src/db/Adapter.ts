import Taro from "@tarojs/taro";

export const FilePath = `${Taro.env.USER_DATA_PATH}/db.json.png`;

export const saveDbFile = () =>
  new Promise((resolve, reject) => {
    // Taro.openDocument({
    //   filePath: FilePath,
    //   fileType: "doc",
    //   success: function(res) {
    //     console.log("打开文档成功");
    //     resolve(res);
    //   },
    //   fail: function(res) {
    //     console.error(res);
    //     reject(res);
    //   }
    // });
    Taro.saveImageToPhotosAlbum({
      filePath: FilePath
    });
  });

export const selectDbFile = () =>
  new Promise((resolve, reject) => {
    Taro.chooseImage({
      count: 1,
      sizeType: ["original"],
      sourceType: ["album"],
      success: function(res) {
        console.log("打开文档成功");
        resolve(res);
      },
      fail: function(res) {
        console.error(res);
        reject(res);
      }
    });
  })
    .then(
      (imgRes: Taro.chooseImage.SuccessCallbackResult) =>
        new Promise<string>((resolve, reject) => {
          const path = imgRes?.tempFilePaths?.[0];
          if (path) {
            fs.readFile({
              filePath: path,
              encoding: "utf8",
              position: 0,
              success(res) {
                if (res?.data) {
                  resolve(res.data as string);
                } else {
                  console.error(res);
                  reject(new Error(JSON.stringify(res)));
                }
              },
              fail(res) {
                console.error(res);
                reject(new Error(JSON.stringify(res)));
              }
            });
          }
        })
    )
    .then((dbstring: string) => {
      fs.writeFile({
        filePath: FilePath,
        data: dbstring,
        encoding: "utf8",
        success(res) {
          // callback();
          Taro.showToast({
            icon: "none",
            title: "导入成功,请重启小程序"
          });
        },
        fail(res) {
          console.error(res);
          throw new Error(JSON.stringify(res));
        }
      });
    });

const fs = Taro.getFileSystemManager();
export class MyCustomAdapter implements LokiPersistenceAdapter {
  loadDatabase(dbname: string, callback: (value: any) => void) {
    fs.readFile({
      filePath: FilePath,
      encoding: "utf8",
      position: 0,
      success(res) {
        if (res?.data) {
          callback(res.data);
        } else {
          console.error(res);
          callback(new Error(JSON.stringify(res)));
        }
      },
      fail(res) {
        console.error(res);
        // 创建文件
        fs.writeFile({
          filePath: FilePath,
          data: "",
          encoding: "utf8",
          success(r) {
            callback("");
          },
          fail(r) {
            console.error(r);
            callback(new Error(JSON.stringify([res, r])));
          }
        });
      }
    });
  }

  saveDatabase(
    dbname: string,
    dbstring: any,
    callback: (err?: Error | null) => void
  ) {
    fs.writeFile({
      filePath: FilePath,
      data: dbstring,
      encoding: "utf8",
      success(res) {
        callback();
      },
      fail(res) {
        console.error(res);
        callback(new Error(JSON.stringify(res)));
      }
    });
  }
}
