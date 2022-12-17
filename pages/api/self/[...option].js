import Airtable from "airtable";

export default async (req, res) => {
  let option = req.query.option;
  let data = {};
  let data1 = {};

  if (
    option?.[0].indexOf("album") >= 0 &&
    option?.[1].indexOf("create") >= 0
  ){
    try {
      Airtable
        .base('appbo8nzfBdKwOEoo')('albums')
        .create([
          {
            fields: {
              ...req.body,
            },
          }
        ], (err, records) => {
          if (err) {
            console.error(err);
            return;
          }
          data = records.map(el => el.fields)
          res.status(200).json(data);
        });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Something went wrong! 😕" });
    }
  } else if(option?.[0].indexOf("albums") >= 0) {
    try {
      data = await Airtable
        .base('appbo8nzfBdKwOEoo')('albums')
        .select({
          view: "Grid view",
          filterByFormula: `{email} = '${option?.[1]}'`,
          sort: [{field: "created", direction: "desc"}],
        })
        .firstPage();
      data = data.map(el => el.fields)
      res.status(200).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Something went wrong! 😕" });
    }
  } else if (option?.[0].indexOf("album") >= 0) {
    try {
      data = await Airtable
        .base('appbo8nzfBdKwOEoo')('photos')
        .select({
          view: "Grid view",
          filterByFormula: `{album_id} = '${option?.[1]}'`,
        })
        .firstPage();
      data1 = await Airtable
        .base('appbo8nzfBdKwOEoo')('texts')
        .select({
          view: "Grid view",
          filterByFormula: `{album_id} = '${option?.[1]}'`,
        })
        .firstPage();
      data = [...data.map(el => el.fields), ...data1.map(el => el.fields)];
      res.status(200).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Something went wrong! 😕" });
    }
  } else if (
    option?.[0].indexOf("photo") >= 0 &&
    option?.[1].indexOf("save") >= 0
   ) {
    try {
      Airtable
        .base('appbo8nzfBdKwOEoo')('photos')
        .create([
          {
            fields: {
              ...req.body,
            },
          }
        ], (err, records) => {
          if (err) {
            console.error(err);
            return;
          }
          data = records.map(el => el.fields)
          res.status(200).json(data);
        });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Something went wrong! 😕" });
    }
  } else if (
    option?.[0].indexOf("text") >= 0 &&
    option?.[1].indexOf("save") >= 0
   ) {
    try {
      Airtable
        .base('appbo8nzfBdKwOEoo')('texts')
        .create([
          {
            fields: {
              ...req.body,
            },
          }
        ], (err, records) => {
          if (err) {
            console.error(err);
            return;
          }
          data = records.map(el => el.fields)
          res.status(200).json(data);
        });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Something went wrong! 😕" });
    }
  } else if (
    option?.[0].indexOf("text") >= 0 &&
    option?.[1].indexOf("delete") >= 0
   ) {
    try {
      Airtable
        .base('appbo8nzfBdKwOEoo')('texts')
        .destroy([option?.[2]], function(err, deletedRecords) {
          if (err) {
            console.error(err);
            return;
          }
          console.log('Deleted', deletedRecords.length, 'records');
          res.status(200).json({ deleted: true });
        });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Something went wrong! 😕" });
    }
  } else {
    res.status(404).json({ msg: "Something went wrong! 😕" });
  }
}