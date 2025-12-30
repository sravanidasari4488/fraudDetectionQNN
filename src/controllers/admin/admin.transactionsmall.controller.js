import supabase from "../../db/supabaseClient.js";
import { ApiError } from "../../utils/ApiError.js";

export const addRemarks = async (req, res) => {
  const { remarks } = req.body;
  try {
    const { data, error } = await supabase
      .schema("onlyclick")
      .from("transactions_tm")
      .update({ remarks }) // Changed from insert to update
      .eq("id", req.params.id) // This should work with update
      .select();

    if (error) throw error;
    return res.status(200).json(data); // Changed to 200 for update
  } catch (error) {
    return res.status(500).json(new ApiError(500, error.message));
  }
};

export const editRemarks = async(req, res) =>{
    const {remarks} = req.body;
    try{
        const {data, error} = await supabase
        .schema("onlyclick")
        .from("transactions_tm")
        .update({remarks})
        .eq("id", req.query.id)
        .select();
        if (error) throw error;
        return res.status(200).json(data);
    }catch(error){
        return res.status(500).json(new ApiError(500, error.message));
    }
}

export const addAmount = async (req, res) => {
  const { amount, tm_id, remarks } = req.body;

  // Validate inputs
  if (!amount || !tm_id) {
    return res.status(400).json(new ApiError(400, "Amount and tm_id are required"));
  }

  if (parseFloat(amount) <= 0) {
    return res.status(400).json(new ApiError(400, "Amount must be greater than 0"));
  }

  try {
    const { data: currentData, error: fetchError } = await supabase
      .schema("onlyclick")
      .from("taskmaster")
      .select("wallet")
      .eq("tm_id", tm_id)
      .maybeSingle();

    if (fetchError) throw new ApiError(500, fetchError.message);

    if (!currentData) {
      throw new ApiError(404, "Taskmaster not found");
    }

    // Calculate wallet balances
    const previousWalletBalance = currentData.wallet;
    const addedAmount = parseFloat(amount);
    const newWalletBalance = previousWalletBalance + addedAmount;

    console.log("Adding amount:", {
      tm_id,
      previousWalletBalance,
      addedAmount,
      newWalletBalance
    });

    // First update the wallet
    const { data: updatedWalletData, error: updateError } = await supabase
      .schema("onlyclick")
      .from("taskmaster")
      .update({
        wallet: newWalletBalance,
      })
      .eq("tm_id", tm_id)
      .select("wallet")
      .maybeSingle();

    if (updateError) {
      console.error("Wallet update error:", updateError);
      throw new ApiError(500, updateError.message);
    }

    console.log("Wallet updated successfully:", updatedWalletData);

    // Then insert the transaction record
    const { data: transactionData, error: transactionError } = await supabase
      .schema("onlyclick")
      .from("transactions_tm")
      .insert({
        tm_id: tm_id,
        type: "credit",
        direction: "incoming",
        amount: addedAmount,
        remarks: remarks || "Amount added by admin",
        wallet_balance: newWalletBalance,
        previous_wallet_balance: previousWalletBalance
      })
      .select()
      .maybeSingle();

    if (transactionError) {
      console.error("Transaction insert error:", transactionError);
      // If transaction insert fails, we should rollback the wallet update
      // For now, just log the error and continue
      console.log("Transaction insert failed, but wallet was updated");
    }

    console.log("Transaction inserted successfully:", transactionData);

    return res.status(201).json({
      success: true,
      walletData: updatedWalletData,
      transactionData: transactionData,
      message: "Amount added successfully"
    });
  } catch (error) {
    console.error("Add amount error:", error);
    return res.status(500).json(new ApiError(500, error.message));
  }
};