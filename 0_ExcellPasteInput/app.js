var app = angular.module('myApp', []);
app.controller('myCtrl', function ($scope) {

    $scope.data = [{

        ID: '',
        Name: '',
        Surname: '',
        Departman: '',
        Date: '',

    }]

    // Bir HTML elemanının üst düzey parent'larını bulmak için kullanılan yardımcı fonksiyon.
    function findParentByTagName(element, tagName) {
        tagName = tagName.toUpperCase();
        var parent = element.parentNode;
        while (parent !== null) {
            if (parent.tagName === tagName) {
                return parent;
            }
            parent = parent.parentNode;
        }
        return null;
    }

    // Verilen bir hücre (cell) elemanının X ve Y pozisyonunu, yani tablodaki satır ve sütun numaralarını belirlemek için kullanılan fonksiyon.
    function findElementCellPosition(elementNode) {
        // Elementin parent <td>, <tr>, ve <table> nodelarını buluyoruz.
        var parentTdNode = findParentByTagName(elementNode, 'TD');
        var parentTrNode = findParentByTagName(elementNode, 'TR');
        var parentTableNode = findParentByTagName(elementNode, 'TABLE');

        // Hücrenin satır ve sütun numaralarını hesaplıyoruz.
        let tdXPosition = Array.prototype.indexOf.call(parentTrNode.cells, parentTdNode);
        let tdYPosition = Array.prototype.indexOf.call(parentTableNode.rows, parentTrNode);

        return [tdXPosition, tdYPosition];
    }

    // Tabloya yapıştırılan metni işleyen $scope.paste fonksiyonu.
    $scope.paste = function (e) {
        console.log(e); // Yapıştırma olayı hakkında bilgiyi konsola yazdırma (isteğe bağlı).

        var pasteDataArray = []; // Yapıştırılan verilerin depolanacağı dizi.
        var item = e.clipboardData.items[0]; // İlk yapıştırılan öğe.

        // Yapıştırılan öğeyi metin olarak almak için getAsString yöntemini kullanın.
        item.getAsString(function (data) {
            var rows = data.split('\n'); // Satırları \n karakteriyle ayırarak bir diziye dönüştürün.

            if (rows != undefined && rows != null && rows.length > 0) {
                // Yapıştırılan metinde satırlar varsa işlem yapın.
                for (let y = 0; y < rows.length; y++) {
                    let cols = rows[y].split('\t'); // Satırdaki sütunları \t karakteriyle ayırarak bir diziye dönüştürün.
                    pasteDataArray.push(cols); // Sütunları pasteDataArray dizisine ekleyin.
                }
            }

            if (pasteDataArray.length > 0) {
                // Yapıştırılan verilerin pasteDataArray dizisinde depolandığını varsayarak devam edin.

                var parentTable = findParentByTagName(e.target, 'TABLE'); // Tabloyu bulma
                var [tdX, tdY] = findElementCellPosition(e.target); // Hücrenin konumunu bulma

                pasteCells(parentTable, tdX, tdY, pasteDataArray); // Hücrelere yapıştırılan verileri yerleştirme
            }
        });
    };
    function pasteCells(tableNode, startPositionX, startPositionY, dataArray) {
        if (dataArray.length > 0) {
            for (var i = 0; i < dataArray.length - 2; i++) {
                // Bu satırlar, eğer tabloya yapıştırılan veri tablodaki mevcut satır sayısından azsa, tablonun boyutunu artırmak için kullanılır.
                $scope.data.push({
                    ID: '',
                    Name: '',
                    Surname: '',
                    Departman: '',
                    Date: '',
                });
            }
        }

        try {
            if (dataArray.length > 0) {
                var inputEvent = new Event('input', { bubbles: true });
                var blurEvent = new Event('blur', { bubbles: true });

                // dataArray dizisini dolaşarak verileri hücrelere yerleştirin.
                for (let y = 0; y < dataArray.length; y++) {
                    // Başlangıç pozisyonundan itibaren her satırı alın.
                    var row = tableNode.rows[startPositionY + y];

                    // Satırdaki sütunları dolaşarak hücrelere verileri yerleştirin.
                    for (let x = 0; x < dataArray[y].length; x++) {
                        // Başlangıç pozisyonundan itibaren her sütunu alın.
                        var cell = row.cells[startPositionX + x];

                        // Hücrenin içerisine yapıştırılacak yeni değeri alın.
                        var newValue = dataArray[y][x];
                        if (newValue == undefined) {
                            newValue = "";
                        }

                        // Hücrenin e-cell özniteliğini alın.
                        let eCellAttrValue = cell.getAttribute("e-cell");

                        // Hücrenin e-cell özniteliği 'input', 'date' veya boşsa, 
                        // hücrenin içine girilen veriyi yerleştirin.
                        if (eCellAttrValue == "input" || eCellAttrValue == 'date' || eCellAttrValue == null) {
                            // Eğer e-cell özniteliği 'date' ise ve yeni değer 10 karakterden küçükse,
                            // başına 0 ekleyin (örn. '09' yerine '9' olmasını engellemek için).
                            if (eCellAttrValue == 'date' && newValue.length < 10) {
                                newValue = '0' + newValue;
                            }

                            // Hücrenin içine girilebilecek input veya e-cell-input elemanını alın.
                            var inputNode = cell.querySelector("[e-cell-input]");

                            if (inputNode == null) {
                                // Eğer e-cell-input elemanı yoksa, hücrenin içindeki herhangi bir input elemanını alın.
                                inputNode = cell.querySelector("input");
                            }

                            if (inputNode != null) {
                                // Hücrenin içine yeni değeri girin ve 'input' ve 'blur' olaylarını tetikleyin.
                                inputNode.value = newValue;
                                inputNode.dispatchEvent(inputEvent);
                                inputNode.dispatchEvent(blurEvent);
                            }
                        }

                        // Hücrenin e-cell özniteliği 'select' ise, seçim kutusuna yeni değeri yerleştirin.
                        if (eCellAttrValue == "select") {
                            let selectNode = cell.querySelector("[e-cell-select]");

                            if (selectNode == null) {
                                // Eğer e-cell-select elemanı yoksa, hücrenin içindeki herhangi bir select elemanını alın.
                                cellValue = cell.querySelector("select");
                            }

                            if (selectNode != null) {
                                let eCellSelectAttrValue = selectNode.getAttribute("e-cell-select");

                                // Eğer e-cell-select özniteliği 'string' ise, yeni değeri "string:" ile başlatın.
                                if (eCellSelectAttrValue == "string") {
                                    selectNode.value = "string:" + newValue;
                                } else {
                                    selectNode.value = newValue;
                                }

                                // Değişikliği tetiklemek için seçim kutusuna 'change' olayını manuel olarak tetikleyin.
                                $timeout(function () {
                                    angular.element(selectNode).trigger('change');
                                }, 0);
                            }
                        }
                    }
                }
            }
        } catch (e) {
            // Hata olması durumunda hatayı göz ardı edin.
        }
    }



});
